import test from "node:test"
import assert from "node:assert/strict"
import vm from "node:vm"
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { bootGuardScript } from "../dist/observability/bootGuard.js"
import { kitBootGuard } from "../dist/vite.js"
import { es5Violations, minifyGuard, render } from "../scripts/build-boot-guard.mjs"

const ORIGIN = "https://football.edwardsfamily.app"

/**
 * Just enough browser to run the guard as index.html would: a window with
 * capture-phase listeners, fake timers, sessionStorage, sendBeacon and a
 * document that can take the fallback. `storage` is shared between "page
 * loads" so the reload guard can be exercised across a reload.
 */
function browser({ storage = new Map(), readyState = "interactive", now = 1_000_000 } = {}) {
  const listeners = []
  const timers = new Map()
  let clock = now
  let nextTimer = 1
  const beacons = []
  const fetches = []
  const appended = []
  const body = { appendChild: (el) => appended.push(el) }
  const elements = new Map()
  function makeEl(tag) {
    const el = {
      tagName: tag.toUpperCase(), id: "", attrs: {}, children: [], innerHTML: "", onclick: null,
      setAttribute(k, v) { this.attrs[k] = v },
      parentNode: { removeChild: (child) => { appended.splice(appended.indexOf(child), 1); elements.delete(child.id) } },
      getElementsByTagName(name) {
        if (!this[`_${name}`]) this[`_${name}`] = { tag: name, text: "", onclick: null, appendChild(t) { this.text += t.data } }
        return [this[`_${name}`]]
      },
    }
    return el
  }
  const location = { protocol: "https:", host: "football.edwardsfamily.app", pathname: "/game/401772937", reloads: 0, reload() { this.reloads++ } }
  const document = {
    readyState,
    body,
    createElement: makeEl,
    createTextNode: (data) => ({ data }),
    getElementById: (id) => appended.find((el) => el.id === id) ?? null,
    addEventListener() {},
  }
  const sessionStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
  }
  const win = {
    document, location, sessionStorage,
    navigator: { userAgent: "Mozilla/5.0 (iPhone)", onLine: true, sendBeacon: (url, data) => (beacons.push({ url, data: JSON.parse(data) }), true) },
    screen: { width: 390, height: 844 },
    crypto: { randomUUID: () => "0f8fad5b-d9cb-469f-a165-70867728950e" },
    fetch: (url, init) => (fetches.push({ url, init }), Promise.resolve()),
    JSON, Math, String, Object, Error,
    Date: class extends Date { constructor(...a) { super(...(a.length ? a : [clock])) } static now() { return clock } },
    setTimeout: (fn, ms) => { const id = nextTimer++; timers.set(id, { fn, at: clock + ms }); return id },
    clearTimeout: (id) => timers.delete(id),
    addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }),
    removeEventListener: (type, fn, capture) => {
      const i = listeners.findIndex((l) => l.type === type && l.fn === fn && l.capture === capture)
      if (i >= 0) listeners.splice(i, 1)
    },
  }
  win.window = win
  vm.createContext(win)
  return {
    win, location, document, storage, beacons, fetches, appended, listeners,
    run(script) { vm.runInContext(script, win) },
    /** A resource failing to load, as the capture phase sees it. */
    fail(tag, attrs) { for (const l of [...listeners]) if (l.type === "error" && l.capture) l.fn({ target: { tagName: tag, ...attrs } }) },
    /** Advance the fake clock, firing due timers in order. */
    tick(ms) {
      const until = clock + ms
      for (;;) {
        const due = [...timers].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0]
        if (!due) break
        timers.delete(due[0])
        clock = due[1].at
        due[1].fn()
      }
      clock = until
    },
    pending: () => timers.size,
  }
}

const opts = { app: "Football", build: "1791503738123" }
const MAIN = `${ORIGIN}/assets/index-wQ90q-cT.js`
const CSS = `${ORIGIN}/assets/index-Bx81kd0A.css`

test("a 404'd main bundle: one report, then one reload for fresh HTML", () => {
  const b = browser()
  b.run(bootGuardScript(opts))
  b.fail("SCRIPT", { src: MAIN })
  b.fail("LINK", { rel: "stylesheet", href: CSS })
  b.tick(1000)
  assert.equal(b.beacons.length, 1, "one report for the whole failed boot")
  assert.equal(b.beacons[0].url, "/internal/errors")
  const [ev] = b.beacons[0].data.events
  assert.equal(b.beacons[0].data.events.length, 1)
  assert.equal(ev.level, "error")
  assert.equal(ev.source, "client")
  assert.equal(ev.message, "The app's code didn't load")
  assert.equal(ev.fingerprint, "boot")
  assert.equal(ev.event_id, "0f8fad5b-d9cb-469f-a165-70867728950e")
  assert.match(ev.occurred_at, /^\d{4}-\d\d-\d\dT/)
  assert.deepEqual(ev.context.failed, ["/assets/index-wQ90q-cT.js", "/assets/index-Bx81kd0A.css"])
  assert.equal(ev.context.kind, "boot")
  assert.equal(ev.context.reason, "asset")
  assert.equal(ev.context.reload, "once")
  assert.equal(ev.context.route, "/game/401772937")
  assert.equal(ev.context.build, "1791503738123")
  assert.equal(ev.context.screen, "390x844")
  assert.equal(ev.context.online, true)
  assert.equal(ev.context.ua, "Mozilla/5.0 (iPhone)")
  assert.equal(b.location.reloads, 1)
  assert.equal(b.appended.length, 0, "no fallback on the first failure: the reload may fix it")
  assert.equal(b.listeners.length, 0, "listeners gone after acting")
  assert.equal(b.pending(), 0, "timers gone after acting")
})

test("the second failure inside 30 s shows the fallback instead of looping", () => {
  const storage = new Map()
  const first = browser({ storage })
  first.run(bootGuardScript(opts))
  first.fail("SCRIPT", { src: MAIN })
  first.tick(1000)
  assert.equal(first.location.reloads, 1)

  const second = browser({ storage, now: 1_000_000 + 5_000 })
  second.run(bootGuardScript(opts))
  second.fail("SCRIPT", { src: MAIN })
  second.tick(1000)
  assert.equal(second.location.reloads, 0, "no second automatic reload")
  assert.equal(second.beacons.length, 1)
  assert.equal(second.beacons[0].data.events[0].context.reload, "blocked")
  assert.equal(second.appended.length, 1, "fallback rendered into <body>")
  const fallback = second.appended[0]
  assert.equal(fallback.id, "kit-boot-guard")
  assert.equal(fallback.attrs.role, "alert")
  assert.equal(fallback._h1.text, "Football couldn’t start")
  assert.match(fallback.innerHTML, /Try again/)
  assert.match(fallback.innerHTML, /prefers-color-scheme|color-scheme:light dark/)
  fallback._button.onclick()
  assert.equal(second.location.reloads, 1, "Try again reloads")

  // Outside the window a later visit may reload again.
  const later = browser({ storage, now: 1_000_000 + 60_000 })
  later.run(bootGuardScript(opts))
  later.fail("SCRIPT", { src: MAIN })
  later.tick(1000)
  assert.equal(later.location.reloads, 1)
})

test("no sessionStorage: report and show the fallback, never an unguarded reload", () => {
  const b = browser()
  b.win.sessionStorage = { getItem() { throw new Error("SecurityError") }, setItem() { throw new Error("x") } }
  b.run(bootGuardScript(opts))
  b.fail("SCRIPT", { src: MAIN })
  b.tick(1000)
  assert.equal(b.location.reloads, 0)
  assert.equal(b.appended.length, 1)
  assert.equal(b.beacons[0].data.events[0].context.reload, "blocked")
})

test("a healthy boot: __kitBooted before the timeout and the guard does nothing at all", () => {
  const b = browser()
  b.run(bootGuardScript(opts))
  assert.equal(b.listeners.length, 1)
  b.tick(2000)
  b.run("window.__kitBooted = true") // what initReporting() does
  assert.equal(b.listeners.length, 0, "listeners removed once booted")
  assert.equal(b.pending(), 0, "timer cleared once booted")
  b.fail("SCRIPT", { src: `${ORIGIN}/assets/Game-abc12345.js` }) // a lazy chunk later: the kit's job now
  b.tick(60_000)
  assert.equal(b.beacons.length, 0)
  assert.equal(b.location.reloads, 0)
  assert.equal(b.appended.length, 0)
  assert.equal(vm.runInContext("window.__kitBooted", b.win), true)
})

test("the real initReporting() is what stands the guard down", async () => {
  const b = browser()
  b.run(bootGuardScript(opts))
  const prev = { window: globalThis.window, document: globalThis.document }
  globalThis.window = b.win
  globalThis.document = b.document
  try {
    const { initReporting } = await import("../dist/observability/reporting.js")
    initReporting({ app: "Football", enabled: false }) // even disabled, it says it booted
  } finally {
    Object.assign(globalThis, prev)
  }
  assert.equal(b.listeners.length, 0)
  b.tick(60_000)
  assert.equal(b.beacons.length, 0)
  assert.equal(b.location.reloads, 0)
})

test("no boot signal by the deadline: a timeout boot failure", () => {
  const b = browser()
  b.run(bootGuardScript({ ...opts, timeoutMs: 5000 }))
  b.tick(4999)
  assert.equal(b.beacons.length, 0)
  b.tick(1)
  assert.equal(b.beacons.length, 1)
  const ctx = b.beacons[0].data.events[0].context
  assert.equal(ctx.reason, "timeout")
  assert.deepEqual(ctx.failed, [])
  assert.equal(ctx.waited_ms, 5000)
  assert.equal(b.location.reloads, 1)
})

test("still parsing at the deadline (slow network): one more wait before calling it", () => {
  const b = browser({ readyState: "loading" })
  b.run(bootGuardScript({ ...opts, timeoutMs: 5000 }))
  b.tick(5000)
  assert.equal(b.beacons.length, 0)
  b.tick(4000)
  b.run("window.__kitBooted = true")
  b.tick(10_000)
  assert.equal(b.beacons.length, 0)
  assert.equal(b.location.reloads, 0)
})

test("other origins, images, other paths and other link rels are ignored", () => {
  const b = browser()
  b.run(bootGuardScript(opts))
  b.fail("SCRIPT", { src: "https://www.googletagmanager.com/gtag/js?id=G-1" })
  b.fail("SCRIPT", { src: "https://cdn.other.app/assets/index-abc.js" })
  b.fail("LINK", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter" })
  b.fail("IMG", { src: `${ORIGIN}/assets/logo-abc.png` })
  b.fail("VIDEO", { src: `${ORIGIN}/assets/intro.mp4` })
  b.fail("LINK", { rel: "icon", href: `${ORIGIN}/assets/favicon.svg` })
  b.fail("LINK", { rel: "manifest", href: `${ORIGIN}/assets/manifest.json` })
  b.fail("SCRIPT", { src: `${ORIGIN}/vendor/widget.js` })
  b.fail("SCRIPT", { src: "" })
  b.tick(1000)
  assert.equal(b.beacons.length, 0)
  assert.equal(b.location.reloads, 0)
  // …and a modulepreload of our own does count.
  b.fail("LINK", { rel: "modulepreload", href: `${ORIGIN}/assets/vendor-react-abc.js` })
  b.tick(1000)
  assert.equal(b.beacons.length, 1)
})

test("options: endpoint, asset prefix; beacon refused → fetch keepalive", () => {
  const b = browser()
  b.win.navigator.sendBeacon = () => false
  b.run(bootGuardScript({ app: "NoFuss", endpoint: "/api/errors", assetPrefix: "/static/" }))
  b.fail("SCRIPT", { src: `${ORIGIN}/assets/index-abc.js` })
  b.tick(1000)
  assert.equal(b.fetches.length, 0, "outside the prefix")
  b.fail("SCRIPT", { src: `${ORIGIN}/static/index-abc.js` })
  b.tick(1000)
  assert.equal(b.fetches.length, 1)
  assert.equal(b.fetches[0].url, "/api/errors")
  assert.equal(b.fetches[0].init.keepalive, true)
  assert.equal(b.fetches[0].init.method, "POST")
  assert.equal(JSON.parse(b.fetches[0].init.body).events[0].context.build, undefined)
})

test("installed twice (plugin + by hand): one guard", () => {
  const b = browser()
  b.run(bootGuardScript(opts))
  b.run(bootGuardScript(opts))
  assert.equal(b.listeners.length, 1)
})

test("never throws, even with no window APIs at all", () => {
  const ctx = vm.createContext({})
  assert.doesNotThrow(() => vm.runInContext(bootGuardScript(opts), ctx))
  const bare = vm.createContext({ window: {} })
  assert.doesNotThrow(() => vm.runInContext(bootGuardScript(opts), bare))
})

test("the script: ES5, ASCII, small, safe to inline, generated file in sync", () => {
  const s = bootGuardScript({ app: "</script><script>alert(1)</script>  ", build: "x" })
  assert.deepEqual(es5Violations(s), [])
  assert.doesNotMatch(s, /<\/script/i)
  assert.doesNotMatch(s, /[^\x00-\x7f]/)
  const plain = bootGuardScript(opts)
  assert.ok(plain.length < 3500, `guard is ${plain.length} bytes`)
  const src = readFileSync(new URL("../src/observability/bootGuard.es5.js", import.meta.url), "utf8")
  const committed = readFileSync(new URL("../src/observability/bootGuard.min.ts", import.meta.url), "utf8")
  assert.equal(render(minifyGuard(src)), committed, "run npm run build and commit bootGuard.min.ts")
  assert.ok(es5Violations("try{}catch{}").length > 0, "the checker catches post-ES5 syntax")
  assert.ok(es5Violations("var f=()=>1").length > 0)
})

test("vite plugin: guard first in <head>, before module scripts, in every entry", async () => {
  const plugin = kitBootGuard({ app: "NoFuss", build: "b1" })
  assert.equal(plugin.apply, "build")
  assert.equal(plugin.transformIndexHtml.order, "pre")
  assert.equal(kitBootGuard({ app: "X", dev: true }).apply, undefined)

  // A real Vite build with two HTML entries (NoFuss has three).
  const { build } = await import("vite")
  const dir = mkdtempSync(join(tmpdir(), "kit-boot-guard-"))
  try {
    const page = (name) => `<!doctype html><html><head><meta charset="UTF-8"><title>${name}</title><link rel="stylesheet" href="./style.css"></head><body><div id="root"></div><script type="module" src="./main.js"></script></body></html>`
    writeFileSync(join(dir, "index.html"), page("index"))
    writeFileSync(join(dir, "admin.html"), page("admin"))
    writeFileSync(join(dir, "main.js"), `import "./dep.js"; console.log("main")`)
    writeFileSync(join(dir, "dep.js"), `export const x = 1`)
    writeFileSync(join(dir, "style.css"), `body{color:red}`)
    await build({
      root: dir, logLevel: "silent", configFile: false,
      plugins: [plugin],
      build: { outDir: join(dir, "dist"), rollupOptions: { input: { index: join(dir, "index.html"), admin: join(dir, "admin.html") } } },
    })
    for (const name of ["index.html", "admin.html"]) {
      const html = readFileSync(join(dir, "dist", name), "utf8")
      const guard = html.indexOf("__kitBootGuard")
      assert.ok(guard > 0, `${name}: guard injected`)
      assert.equal((html.match(/__kitBootGuard=1/g) ?? []).length, 1, `${name}: exactly once`)
      const head = html.indexOf("<head>")
      const firstTagAfterHead = html.slice(head + 6).trimStart()
      assert.match(firstTagAfterHead, /^<script>\(function/, `${name}: first thing in <head>`)
      const moduleScript = html.indexOf('<script type="module"')
      assert.ok(moduleScript > guard, `${name}: before the module script`)
      const css = html.indexOf('rel="stylesheet"')
      assert.ok(css > guard, `${name}: before the stylesheet`)
      assert.match(html, /"a":"NoFuss","b":"b1"/)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
