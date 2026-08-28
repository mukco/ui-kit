import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { age } from "../dist/lib/age.js"

// Two apps were pulling date-fns in for exactly this string; the kit renders
// it in TriageList and NewsPanel and now has one implementation of it.

const ago = (ms) => new Date(Date.now() - ms).toISOString()
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR

describe("age", () => {
  it("returns null for nothing and for junk, rather than 'Invalid Date ago'", () => {
    assert.equal(age(null), null)
    assert.equal(age(undefined), null)
    assert.equal(age(""), null)
    assert.equal(age("not a date"), null)
  })

  it("collapses the last minute and a half to 'just now'", () => {
    assert.equal(age(ago(5_000)), "just now")
    assert.equal(age(ago(80_000)), "just now")
  })

  it("steps up through minutes, hours and days", () => {
    assert.equal(age(ago(20 * MIN)), "20m ago")
    assert.equal(age(ago(5 * HOUR)), "5h ago")
    assert.equal(age(ago(3 * DAY)), "3d ago")
  })

  it("keeps hours up to two days, so 'yesterday evening' does not read as 1d", () => {
    assert.equal(age(ago(30 * HOUR)), "30h ago")
    assert.equal(age(ago(50 * HOUR)), "2d ago")
  })

  it("switches to months rather than counting past 30 days", () => {
    assert.equal(age(ago(29 * DAY)), "29d ago")
    assert.equal(age(ago(60 * DAY)), "2mo ago")
  })
})
