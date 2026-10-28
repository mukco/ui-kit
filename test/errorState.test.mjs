import test from "node:test"
import assert from "node:assert/strict"

const { couldNotLoad, busyLine } = await import("../dist/primitives/errorCopy.js")

test("a failed read is said one way", () => {
  assert.equal(couldNotLoad("news"), "Couldn't load news.")
  assert.equal(couldNotLoad("the schedule"), "Couldn't load the schedule.")
})

test("a held-back retry counts down in seconds", () => {
  assert.equal(busyLine(12), "Busy · try again in 12s")
})
