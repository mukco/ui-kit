import test from "node:test"
import assert from "node:assert/strict"
import { readyForNewBuild } from "../dist/primitives/updateReady.js"

// A service worker container just real enough to sequence against.
function fakeSw({ registration = null, controller = {}, } = {}) {
  const listeners = new Set()
  return {
    controller,
    getRegistration: async () => registration,
    addEventListener: (_t, fn) => listeners.add(fn),
    removeEventListener: (_t, fn) => listeners.delete(fn),
    fireControllerChange: () => listeners.forEach((fn) => fn()),
    listenerCount: () => listeners.size,
  }
}
const nav = (sw) => (sw ? { serviceWorker: sw } : {})

test("no service worker: returns at once, nothing to wait for", async () => {
  await readyForNewBuild(50, nav(null))
})

test("no registration: returns at once", async () => {
  await readyForNewBuild(50, nav(fakeSw({ registration: null })))
})

// The actual bug. A worker is waiting for every tab to close, which on an
// installed app may be never, so the old one keeps serving the old build.
test("a waiting worker is told to take over, and we wait for the handover", async () => {
  let told = null
  const registration = { waiting: { postMessage: (m) => { told = m } }, update: async () => {} }
  const sw = fakeSw({ registration })
  const done = readyForNewBuild(1000, nav(sw))
  await new Promise((r) => setTimeout(r, 10))
  assert.deepEqual(told, { type: "SKIP_WAITING" }, "must ask the waiting worker to skip")
  sw.fireControllerChange()
  await done
})

test("resolves on controllerchange rather than on the timeout", async () => {
  const registration = { waiting: { postMessage() {} }, update: async () => {} }
  const sw = fakeSw({ registration })
  const started = Date.now()
  const done = readyForNewBuild(10_000, nav(sw))
  await new Promise((r) => setTimeout(r, 10))
  sw.fireControllerChange()
  await done
  assert.ok(Date.now() - started < 1_000, "should not have waited for the timeout")
})

// A toast that hangs is worse than one that reloads a moment early.
test("never waits longer than the timeout", async () => {
  const registration = { waiting: { postMessage() {} }, update: async () => {} }
  const started = Date.now()
  await readyForNewBuild(120, nav(fakeSw({ registration })))
  assert.ok(Date.now() - started >= 100, "should have waited for the timeout")
})

test("nothing waiting and nothing installing: returns rather than hanging", async () => {
  let updated = false
  const registration = { waiting: null, installing: null, update: async () => { updated = true } }
  const started = Date.now()
  await readyForNewBuild(10_000, nav(fakeSw({ registration })))
  assert.ok(updated, "should still nudge the registration")
  assert.ok(Date.now() - started < 1_000, "must not wait for an event that will never fire")
})

test("an installing worker is waited for", async () => {
  const registration = { waiting: null, installing: {}, update: async () => {} }
  const sw = fakeSw({ registration })
  const done = readyForNewBuild(1000, nav(sw))
  await new Promise((r) => setTimeout(r, 10))
  sw.fireControllerChange()
  await done
})

test("a failing update does not reject", async () => {
  const registration = { waiting: null, installing: null, update: async () => { throw new Error("offline") } }
  await readyForNewBuild(100, nav(fakeSw({ registration })))
})

test("the controllerchange listener is removed, so nothing leaks", async () => {
  const registration = { waiting: { postMessage() {} }, update: async () => {} }
  const sw = fakeSw({ registration })
  const done = readyForNewBuild(1000, nav(sw))
  await new Promise((r) => setTimeout(r, 10))
  sw.fireControllerChange()
  await done
  assert.equal(sw.listenerCount(), 0)
})
