import test from "node:test"
import assert from "node:assert/strict"
import { isStaleChunk, claimReload, RELOAD_WINDOW_MS } from "../dist/observability/chunk.js"
import { buildEvent, fingerprintOf, normalizeMessage, topFrame, fitContext } from "../dist/observability/event.js"
import { createDeduper, createQueue } from "../dist/observability/queue.js"
import { startSession, diedLastTime, readMark } from "../dist/observability/session.js"
import { captureConsole, wrapFetch, formatConsoleArgs, requestPath, CAPTURE_CAP } from "../dist/observability/capture.js"

function fakeStorage(seed = {}) {
  const m = new Map(Object.entries(seed))
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    dump: () => Object.fromEntries(m),
  }
}

// ---- stale chunks --------------------------------------------------------

test("stale-chunk regex: every browser's wording, and nothing else", () => {
  for (const msg of [
    "Failed to fetch dynamically imported module: https://x/assets/Game-abc.js", // Chrome
    "error loading dynamically imported module", // Firefox
    "Importing a module script failed.", // Safari
    "Loading chunk 42 failed.", // webpack
    "Loading CSS chunk 3 failed.",
    "Unable to preload CSS for /assets/index-abc.css", // Vite
  ]) assert.equal(isStaleChunk(new Error(msg)), true, msg)
  assert.equal(isStaleChunk({ name: "ChunkLoadError", message: "" }), true)
  assert.equal(isStaleChunk("Importing a module script failed."), true)
  assert.equal(isStaleChunk(new TypeError("Cannot read properties of undefined (reading 'id')")), false)
  assert.equal(isStaleChunk(null), false)
  assert.equal(isStaleChunk(undefined), false)
})

test("reload guard: once per 30s, a timestamp that needs no clearing", () => {
  const s = fakeStorage()
  const t0 = 1_000_000
  assert.equal(claimReload(s, "k", t0), true, "first stale chunk reloads")
  assert.equal(claimReload(s, "k", t0 + 5_000), false, "a second inside the window does not loop")
  assert.equal(claimReload(s, "k", t0 + RELOAD_WINDOW_MS - 1), false)
  assert.equal(claimReload(s, "k", t0 + RELOAD_WINDOW_MS + 1), true, "a later visit may try again")
  assert.equal(Number(s.getItem("k")), t0 + RELOAD_WINDOW_MS + 1)
})

test("reload guard: storage refused still reloads once rather than stranding", () => {
  const broken = { getItem() { throw new Error("SecurityError") }, setItem() { throw new Error("x") }, removeItem() {} }
  assert.equal(claimReload(broken, "k", 1), true)
  assert.equal(claimReload(null, "k", 1), true)
})

// ---- events and fingerprints ---------------------------------------------

test("normalizeMessage folds ids, numbers and quoted strings", () => {
  assert.equal(normalizeMessage("row 41 missing"), normalizeMessage("row 42 missing"))
  assert.equal(normalizeMessage(`no player "Ohtani"`), normalizeMessage(`no player "Judge"`))
  assert.equal(
    normalizeMessage("game 3f2b8c1e-0b7a-4c1e-9d2f-1a2b3c4d5e6f gone"),
    normalizeMessage("game 9a8b7c6d-0b7a-4c1e-9d2f-1a2b3c4d5e6f gone"),
  )
  assert.notEqual(normalizeMessage("cannot read id"), normalizeMessage("cannot read name"))
})

test("topFrame drops the build hash and line/column", () => {
  const a = "TypeError: x\n    at Game (https://fb.app/assets/Game-B3xYz8_Q.js:1:2345)"
  const b = "TypeError: x\n    at Game (https://fb.app/assets/Game-Zz91kLmP.js:1:999)"
  assert.equal(topFrame(a), topFrame(b))
  assert.match(topFrame(a), /Game/)
  assert.equal(topFrame("render@https://fb.app/assets/index-AbCdEfGh.js:3:4"), topFrame("render@https://fb.app/assets/index-ZyXwVuTs.js:9:9"))
  assert.equal(topFrame(undefined), "")
})

test("fingerprint: same bug across deploys groups; a custom key wins", () => {
  const e1 = { level: "error", message: "row 41 missing", error_class: "TypeError", stack: "TypeError\n    at f (https://a/x-AAAAAAAA.js:1:1)" }
  const e2 = { level: "error", message: "row 7 missing", error_class: "TypeError", stack: "TypeError\n    at f (https://a/x-BBBBBBBB.js:2:2)" }
  assert.equal(fingerprintOf(e1), fingerprintOf(e2))
  assert.notEqual(fingerprintOf(e1), fingerprintOf({ ...e1, level: "warning" }))
  assert.equal(fingerprintOf({ ...e1, fingerprint: "custom" }), "custom")
})

test("buildEvent: contract shape, clipped fields, fingerprint lifted out of context", () => {
  const err = new TypeError("x".repeat(5000))
  const ev = buildEvent({ level: "error", source: "client", thrown: err, context: { kind: "boundary", fingerprint: "fp", route: "/g" }, base: { build: "b1", route: "/" }, now: Date.UTC(2026, 9, 9) })
  assert.equal(ev.level, "error")
  assert.equal(ev.source, "client")
  assert.equal(ev.error_class, "TypeError")
  assert.ok(ev.message.length <= 1000)
  assert.equal(ev.fingerprint, "fp")
  assert.equal(ev.context.fingerprint, undefined)
  assert.equal(ev.context.kind, "boundary")
  assert.equal(ev.context.route, "/g", "caller context beats page context")
  assert.equal(ev.context.build, "b1")
  assert.equal(ev.occurred_at, "2026-10-09T00:00:00.000Z")
  assert.match(ev.event_id, /^[0-9a-f-]{36}$/)
  const plain = buildEvent({ level: "info", source: "tv", thrown: "hello" })
  assert.equal(plain.message, "hello")
  assert.equal(plain.context.kind, "manual")
  assert.equal(buildEvent({ level: "error", source: "client", thrown: { code: 7 } }).message, '{"code":7}')
})

test("fitContext keeps the context under 8 KB, shedding bulk first", () => {
  const big = fitContext({ kind: "boundary", route: "/", component_stack: "x".repeat(20000), breadcrumbs: Array.from({ length: 40 }, (_, i) => `c${i}`) })
  assert.ok(JSON.stringify(big).length <= 8192)
  assert.equal(big.breadcrumbs.length, 20)
  assert.equal(big.breadcrumbs.at(-1), "c39", "newest crumbs kept")
  const huge = fitContext({ kind: "manual", route: "/", blob: "y".repeat(20000) })
  assert.ok(JSON.stringify(huge).length <= 8192)
  assert.equal(huge.route, "/")
  assert.equal(huge.context_truncated, true)
})

// ---- dedupe and queue ----------------------------------------------------

test("dedupe: same fingerprint at most 5 times per page, total cap", () => {
  const d = createDeduper()
  const ev = { level: "error", message: "boom 1", error_class: "Error" }
  const results = Array.from({ length: 8 }, (_, i) => d.accept({ ...ev, message: `boom ${i}` }))
  assert.deepEqual(results, [true, true, true, true, true, false, false, false])
  assert.equal(d.accept({ ...ev, message: "different" }), true)
  const capped = createDeduper({ total: 3 })
  assert.deepEqual(["a", "b", "c", "d"].map((m) => capped.accept({ level: "info", message: m })), [true, true, true, false])
})

function manualTimers() {
  const pending = []
  return { setTimer: (fn) => pending.push(fn), run: () => { while (pending.length) pending.shift()() }, count: () => pending.length }
}
const ev = (i, extra = {}) => ({ event_id: `id${i}`, level: "error", source: "client", message: `m${i}`, occurred_at: "t", context: {}, ...extra })

test("queue: batches of ≤ 10 via fetch keepalive after a delay", async () => {
  const sent = []
  const timers = manualTimers()
  const q = createQueue({ endpoint: "/internal/errors", transport: { fetch: async (url, init) => { sent.push({ url, init }) } }, setTimer: timers.setTimer })
  for (let i = 0; i < 23; i++) q.push(ev(i))
  assert.equal(sent.length, 0, "nothing sent synchronously")
  assert.equal(timers.count(), 1, "one timer, not one per event")
  timers.run()
  assert.equal(sent.length, 3)
  assert.deepEqual(sent.map((s) => JSON.parse(s.init.body).events.length), [10, 10, 3])
  assert.equal(sent[0].url, "/internal/errors")
  assert.equal(sent[0].init.keepalive, true)
  assert.equal(sent[0].init.method, "POST")
  assert.equal(sent[0].init.headers["Content-Type"], "application/json")
})

test("queue: leaving the page uses sendBeacon, falling back to fetch when it refuses", () => {
  const beacons = []
  const fetched = []
  let accept = true
  const q = createQueue({
    endpoint: "/e",
    transport: { beacon: (url, body) => { beacons.push(JSON.parse(body)); return accept }, fetch: async (_u, init) => { fetched.push(init) } },
    setTimer: () => {},
  })
  q.push(ev(1))
  q.flush(true)
  assert.equal(beacons.length, 1)
  assert.equal(beacons[0].events[0].event_id, "id1")
  accept = false
  q.push(ev(2))
  q.flush(true)
  assert.equal(fetched.length, 1, "beacon refused (quota) → keepalive fetch")
  assert.equal(q.size(), 0)
})

test("queue: splits by bytes and drops an event too big to ever send", () => {
  const sent = []
  const q = createQueue({ endpoint: "/e", maxBytes: 2000, transport: { fetch: async (_u, init) => { sent.push(JSON.parse(init.body)) } }, setTimer: () => {} })
  q.push(ev(1, { stack: "s".repeat(900) }))
  q.push(ev(2, { stack: "s".repeat(900) }))
  q.push(ev(3, { stack: "s".repeat(5000) }))
  q.flush()
  assert.equal(sent.length, 2)
  assert.deepEqual(sent.flatMap((b) => b.events.map((e) => e.event_id)), ["id1", "id2"])
})

test("queue: a failed send is retried once, then dropped", async () => {
  let calls = 0
  const timers = manualTimers()
  const q = createQueue({ endpoint: "/e", transport: { fetch: async () => { calls++; throw new TypeError("offline") } }, setTimer: timers.setTimer })
  q.push(ev(1))
  timers.run()
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(q.size(), 1, "requeued once")
  timers.run()
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(calls, 2)
  assert.equal(q.size(), 0, "then gone — no retry storm")
})

// ---- session died --------------------------------------------------------

test("session-died: a session that was live on screen and never closed is reported next launch", () => {
  const store = fakeStorage()
  let now = 1_000_000
  const first = startSession(store, "fb-session-mark", { id: "a", now: () => now, build: "b1" })
  assert.equal(first.died, null, "fresh device: nothing to report")
  now += 5_000
  first.beat("/game/1", ["1s route /", "4s route /game/1"])
  // …the process is killed: no clean() ever runs.
  now += 20_000
  const second = startSession(store, "fb-session-mark", { id: "b", now: () => now, build: "b2" })
  assert.ok(second.died)
  assert.equal(second.died.route, "/game/1")
  assert.deepEqual(second.died.breadcrumbs, ["1s route /", "4s route /game/1"])
  assert.equal(second.died.build, "b1", "the build that died, not the one reporting")
  second.clean()
  const third = startSession(store, "fb-session-mark", { id: "c", now: () => now + 1000 })
  assert.equal(third.died, null, "reported once: the new session overwrote the dead one's mark")
})

test("session-died: pagehide or going hidden is a clean exit", () => {
  const store = fakeStorage()
  let now = 5_000_000
  const a = startSession(store, "k", { id: "a", now: () => now })
  a.beat("/")
  a.clean()
  now += 10_000
  assert.equal(startSession(store, "k", { id: "b", now: () => now }).died, null)
  assert.equal(readMark(store, "k").clean, false, "the new session is live until it closes")
})

test("session-died: back on screen makes it live again; an ancient mark is ignored", () => {
  const store = fakeStorage()
  let now = 9_000_000
  const a = startSession(store, "k", { id: "a", now: () => now })
  a.clean()
  a.live()
  now += 1_000
  assert.ok(startSession(store, "k", { id: "b", now: () => now }).died, "died after returning to the front")
  assert.equal(diedLastTime({ id: "x", beat: 0, started: 0, clean: false }, 7 * 60 * 60 * 1000), null, "older than 6h")
  assert.equal(diedLastTime(null, 1), null)
  assert.equal(readMark(fakeStorage({ k: "not json" }), "k"), null)
})

// ---- console and network capture ----------------------------------------

function hooks(overrides = {}) {
  const reports = []
  const notes = []
  const reported = new WeakSet()
  const h = {
    report: (level, thrown, context) => reports.push({ level, thrown, context }),
    note: (w) => notes.push(w),
    alreadyReported: (x) => !!x && typeof x === "object" && reported.has(x),
    isOwn: (url) => url.startsWith("/internal/errors"),
    defer: (fn) => fn(),
    now: () => 0,
    quiet: () => false,
    base: () => "https://fb.app/game/1",
    ...overrides,
  }
  return { h, reports, notes, reported }
}

test("console.error → warning (kind console), always calling through", () => {
  const calls = []
  const fake = { error: (...a) => calls.push(["error", ...a]), warn: (...a) => calls.push(["warn", ...a]) }
  const { h, reports, notes } = hooks()
  captureConsole(fake, h)
  const e = new RangeError("bad index")
  fake.error("Failed to render %s:", "Scoreboard", e)
  assert.equal(calls.length, 1, "original console.error still ran")
  assert.equal(reports.length, 1)
  assert.equal(reports[0].level, "warning")
  assert.equal(reports[0].context.kind, "console")
  assert.equal(reports[0].thrown.name, "RangeError")
  assert.match(reports[0].thrown.message, /^Failed to render Scoreboard: RangeError: bad index/)
  fake.warn("deprecated prop", { a: 1 })
  assert.equal(calls.length, 2)
  assert.equal(reports.length, 1, "warn is not a report")
  assert.match(notes[0], /^console\.warn: deprecated prop \{"a":1\}/)
})

test("console capture: an Error already reported (boundary) is not sent again; hard cap", () => {
  const fake = { error: () => {}, warn: () => {} }
  const { h, reports, reported } = hooks()
  captureConsole(fake, h)
  const e = new Error("render crash")
  reported.add(e)
  fake.error(e)
  fake.error("The above error occurred in the <Game> component")
  assert.equal(reports.length, 0)
  for (let i = 0; i < CAPTURE_CAP + 10; i++) fake.error(`noise ${i}`)
  assert.equal(reports.length, CAPTURE_CAP)
})

test("console capture: a report that logs does not recurse", () => {
  const fake = { error: () => {}, warn: () => {} }
  let depth = 0
  const { h } = hooks({ report: () => { depth++; if (depth < 5) fake.error("from inside the reporter") } })
  captureConsole(fake, h)
  fake.error("outer")
  assert.ok(depth <= 2, `recursed ${depth} times`)
})

test("formatConsoleArgs handles %c, circular objects, and odd values", () => {
  assert.equal(formatConsoleArgs(["%cHi", "color: red"]), "Hi")
  const a = { n: 1 }
  a.self = a
  assert.match(formatConsoleArgs(["x", a]), /\[circular\]/)
  assert.equal(formatConsoleArgs([undefined, null, 3]), "undefined null 3")
})

test("requestPath never keeps the query string", () => {
  assert.equal(requestPath("/api/me?token=secret", "https://fb.app/"), "/api/me")
  assert.equal(requestPath("https://espn.com/scores?key=k#x", "https://fb.app/"), "espn.com/scores")
})

test("fetch capture: breadcrumb per request, 5xx and failures reported, aborts and own endpoint not", async () => {
  const { h, reports, notes } = hooks({ now: (() => { let t = 0; return () => (t += 42) })() })
  const responses = {
    "/api/me?x=1": async () => ({ status: 200 }),
    "/api/games": async () => ({ status: 502 }),
    "/api/missing": async () => ({ status: 404 }),
    "/api/down": async () => { throw new TypeError("Failed to fetch") },
    "/api/abort": async () => { throw Object.assign(new Error("aborted"), { name: "AbortError" }) },
    "/internal/errors": async () => ({ status: 202 }),
  }
  const f = wrapFetch((url) => responses[url](), h)
  const original = responses["/api/me?x=1"]
  const p = f("/api/me?x=1")
  assert.ok(p instanceof Promise)
  assert.equal((await p).status, 200)
  void original
  await f("/api/games", { method: "post" })
  await f("/api/missing")
  await f("/api/down").catch(() => {})
  await f("/api/abort").catch(() => {})
  await f("/internal/errors", { method: "POST" })
  await new Promise((r) => setTimeout(r, 0))
  assert.deepEqual(notes.map((n) => n.replace(/\d+ms$/, "Nms")), [
    "GET /api/me 200 Nms",
    "POST /api/games 502 Nms",
    "GET /api/missing 404 Nms",
    "GET /api/down failed Nms",
    "GET /api/abort aborted Nms",
  ])
  assert.equal(reports.length, 2)
  assert.equal(reports[0].level, "warning")
  assert.deepEqual({ ...reports[0].context, duration_ms: 0 }, { kind: "network", method: "POST", path: "/api/games", status: 502, duration_ms: 0 })
  assert.equal(reports[1].context.path, "/api/down")
  assert.match(reports[1].context.err, /Failed to fetch/)
})

test("fetch capture: the caller still sees the rejection; offline failures are not reports", async () => {
  const { h, reports } = hooks({ quiet: () => true })
  const f = wrapFetch(async () => { throw new TypeError("Load failed") }, h)
  await assert.rejects(f("/api/x"), /Load failed/)
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(reports.length, 0)
})

// ---- the page reporter, end to end on a fake window ---------------------

test("initReporting: no-op before init and when disabled; reports flow to the endpoint once on", async () => {
  const sent = []
  const listeners = {}
  const on = (bag) => (type, fn) => { (bag[type] ??= []).push(fn) }
  const docListeners = {}
  globalThis.window = {
    addEventListener: on(listeners),
    location: { pathname: "/", href: "https://fb.app/", origin: "https://fb.app", reload() {} },
    screen: { width: 390, height: 844 },
    localStorage: fakeStorage(),
    sessionStorage: fakeStorage(),
    fetch: async (_u, init) => { sent.push(JSON.parse(init.body)); return { status: 202 } },
  }
  globalThis.document = { visibilityState: "visible", readyState: "complete", addEventListener: on(docListeners), removeEventListener() {} }
  globalThis.history = { pushState() { window.location.pathname = "/fantasy" }, replaceState() {} }
  const m = await import("../dist/observability/core.js")
  m.report.error(new Error("before init"))
  m.initReporting({ app: "Football", build: "b9", enabled: false, console: false })
  assert.equal(m.reportingActive(), false)
  m.initReporting({ app: "Football", build: "b9", console: false, network: false, sessionDied: false })
  assert.equal(m.reportingActive(), true)
  m.note("tap Fantasy")
  history.pushState({}, "", "/fantasy")
  for (let i = 0; i < 7; i++) m.report.error(new TypeError(`boom ${i}`))
  m.report.warning("Lidarr refused import", { album: "x" })
  for (const fn of listeners.pagehide) fn()
  await new Promise((r) => setTimeout(r, 0))
  const events = sent.flatMap((b) => b.events)
  assert.equal(events.filter((e) => e.message.startsWith("boom")).length, 5, "deduped to 5")
  assert.ok(!events.some((e) => e.message === "before init"))
  const boom = events[0]
  assert.equal(boom.context.build, "b9")
  assert.equal(boom.context.route, "/fantasy")
  assert.equal(boom.context.screen, "390x844")
  assert.deepEqual(boom.context.breadcrumbs.map((c) => c.replace(/^\d+s /, "")), ["route /", "tap Fantasy", "route /fantasy"])
  const warn = events.find((e) => e.level === "warning")
  assert.equal(warn.context.album, "x")
  assert.equal(warn.context.kind, "manual")
  assert.ok(listeners.error && listeners.unhandledrejection, "global listeners installed by init")
})
