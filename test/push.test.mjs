// The push client's options (2026-10-09): readable errors, an app's own
// fetcher, the opt-in "Not now" snooze and configurable paths — added when
// Family Hub moved onto createPushClient. Runs against dist/ on plain node,
// with the browser faked.
import { beforeEach, test } from "node:test"
import assert from "node:assert/strict"

const store = new Map()
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => { store.set(k, v) },
  removeItem: (k) => { store.delete(k) },
} })

const KEY_B64 = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
const KEY = Uint8Array.from(atob(KEY_B64.replace(/-/g, "+").replace(/_/g, "/") + "="), (c) => c.charCodeAt(0))
let made = 0
let held = null
const subscription = (key) => {
  const n = ++made
  return {
    endpoint: `https://push.test/${n}`, options: { applicationServerKey: key ? key.slice().buffer : null },
    toJSON() { return { endpoint: this.endpoint } },
    async unsubscribe() { held = held === this ? null : held; return true },
  }
}
const registration = { pushManager: {
  getSubscription: async () => held,
  subscribe: async (o) => { held = subscription(o.applicationServerKey); return held },
} }
Object.defineProperty(globalThis, "navigator", { configurable: true, value: { userAgent: "test", serviceWorker: { ready: Promise.resolve(registration) } } })
class FakeNotification {
  static permission = "default"
  static async requestPermission() { FakeNotification.permission = "granted"; return "granted" }
}
Object.assign(globalThis, { Notification: FakeNotification, PushManager: class {}, window: globalThis })

let calls = []
let answer = () => null
let offline = false
globalThis.fetch = async (path, init = {}) => {
  if (offline) throw new TypeError("Failed to fetch")
  const method = init.method ?? "GET"
  calls.push(`${method} ${path}`)
  const custom = answer(path, method)
  if (custom) return custom
  if (path.endsWith("/key")) return new Response(JSON.stringify({ public_key: KEY_B64 }), { status: 200 })
  return new Response(null, { status: 201 })
}

const { createPushClient, pushErrorMessage, pushFetch, PushApiError } = await import("../dist/primitives/push.js")

beforeEach(() => {
  store.clear(); calls = []; held = null; made = 0; offline = false; answer = () => null
  FakeNotification.permission = "default"
})

// ---- Errors a person can read -------------------------------------------

test("a refusal without a reason says what went wrong in words, not '500 /api/push/subscription'", async () => {
  answer = (path, method) => (method === "POST" ? new Response("<html>oops</html>", { status: 500 }) : null)
  const push = createPushClient({ storagePrefix: "t" })
  await assert.rejects(push.enablePush(), (e) => e instanceof PushApiError && e.status === 500 && e.message === pushErrorMessage(500))
  assert.equal(pushErrorMessage(500), "Something went wrong on the server — try again.")
})

test("the server's own reason wins, as error or errors", async () => {
  answer = (path, method) => (method === "POST" ? new Response(JSON.stringify({ error: "That device is not yours." }), { status: 422 }) : null)
  await assert.rejects(createPushClient({ storagePrefix: "t" }).enablePush(), /That device is not yours\./)
  answer = (path, method) => (method === "POST" ? new Response(JSON.stringify({ errors: [ "Endpoint is invalid", "Keys are missing" ] }), { status: 422 }) : null)
  await assert.rejects(pushFetch("/api/push/subscription", { method: "POST" }), /Endpoint is invalid Keys are missing/)
})

test("no connection is status 0 and says so, not the browser's 'Failed to fetch'", async () => {
  offline = true
  await assert.rejects(pushFetch("/api/push/key"), (e) => e.status === 0 && e.message === "Couldn't reach the server — check the connection.")
})

test("no key on the server: Turn on fails rather than pretending", async () => {
  answer = (path) => (path.endsWith("/key") ? new Response(JSON.stringify({ public_key: null }), { status: 200 }) : null)
  await assert.rejects(createPushClient({ storagePrefix: "t" }).enablePush(), /Push isn't configured on the server/)
})

// ---- The app's own fetcher ------------------------------------------------

test("a fetcher carries every request, and its status-410 error still triggers the fresh subscription", async () => {
  const seen = []
  let first = true
  const fetcher = async (path, init) => {
    seen.push(`${init?.method ?? "GET"} ${path}`)
    if (path.endsWith("/key")) return { public_key: KEY_B64 }
    if (init?.method === "POST" && first) { first = false; throw Object.assign(new Error("gone"), { status: 410 }) }
    return undefined
  }
  held = subscription(KEY)
  const push = createPushClient({ storagePrefix: "t", fetcher })
  assert.equal(await push.enablePush(), "on")
  assert.deepEqual(calls, [])
  assert.deepEqual(seen, [ "GET /api/push/key", "POST /api/push/subscription", "POST /api/push/subscription" ])
  assert.equal(held.endpoint, "https://push.test/2")
})

// ---- Paths ------------------------------------------------------------------

test("paths can be moved; the defaults are the template apps'", async () => {
  const push = createPushClient({ storagePrefix: "t", paths: { key: "/push/key", subscription: "/push/sub", notify: "/prefs", test: "/push/ping", follow: (id) => `/follow/${id}` } })
  await push.enablePush()
  await push.notify.get().catch(() => undefined)
  await push.notify.test().catch(() => undefined)
  await push.notify.follow("g1", true).catch(() => undefined)
  assert.deepEqual(calls, [ "GET /push/key", "POST /push/sub", "GET /prefs", "POST /push/ping", "POST /follow/g1" ])
  calls = []
  const plain = createPushClient({ storagePrefix: "u" })
  await plain.notify.follow("g1", false).catch(() => undefined)
  assert.deepEqual(calls, [ "DELETE /api/notify/games/g1" ])
})

// ---- Not now ----------------------------------------------------------------

test("without snooze: true, nothing is read or written for it", async () => {
  store.set("t-push-snoozed-until", String(Date.now() + 60_000))
  const push = createPushClient({ storagePrefix: "t" })
  push.snooze(60_000)
  await push.enablePush()
  assert.equal(push.snooze.length, 1)
  assert.ok(store.has("t-push-snoozed-until"), "an app that never asked for it keeps its storage as it was")
  assert.equal(store.get("t-push-subscribed"), "1")
})

test("with snooze: true, Not now is remembered, and Turn on clears it with an earlier Off", async () => {
  const push = createPushClient({ storagePrefix: "fh", snooze: true })
  const before = Date.now()
  push.snooze(7 * 24 * 60 * 60 * 1000)
  const until = Number(store.get("fh-push-snoozed-until"))
  assert.ok(until >= before + 7 * 24 * 60 * 60 * 1000)
  store.set("fh-push-off", "1")
  const restarted = createPushClient({ storagePrefix: "fh", snooze: true })
  await restarted.enablePush()
  assert.equal(store.has("fh-push-snoozed-until"), false)
  assert.equal(store.has("fh-push-off"), false)
  assert.equal(store.get("fh-push-subscribed"), "1")
})
