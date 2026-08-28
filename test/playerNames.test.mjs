import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { extractCandidates, matchKey, resolveKnownPlayers } from "../dist/sports/playerNames.js"

// Moved here with the code. These arrived as baseball's regression tests for a
// series of reported bugs — the Jr. bug, the Acuña bug, the De La Cruz bug —
// and football had a copy of the same helpers with no tests at all. Keeping
// them next to the one implementation is the point of the move.

// A prose candidate links only when its matchKey equals the search result's
// matchKey, so these two helpers together are what make a name clickable.
const links = (proseName, apiFullName) => matchKey(proseName) === matchKey(apiFullName)

describe("extractCandidates", () => {
  it("captures a generational suffix as part of the name span (the reported Jr. bug)", () => {
    assert.deepEqual(extractCandidates("Lourdes Gurriel Jr. ($10) is ice cold"), ["Lourdes Gurriel Jr."])
  })

  it("captures II/III suffixes without splitting the trailing numerals", () => {
    assert.deepEqual(extractCandidates("Michael Harris II broke out"), ["Michael Harris II"])
    assert.deepEqual(extractCandidates("Cal Ripken III did it"), ["Cal Ripken III"])
  })

  it("captures accented names without truncating at the accent (the reported Acuña bug)", () => {
    assert.deepEqual(extractCandidates("Ronald Acuña Jr. powered the Braves' offense"), ["Ronald Acuña Jr."])
    assert.deepEqual(extractCandidates("José Ramírez crushed two homers"), ["José Ramírez"])
    assert.deepEqual(extractCandidates("Sandy Alcántara dealt seven innings"), ["Sandy Alcántara"])
  })

  it("captures multi-word surnames as one unit (the reported De La Cruz bug)", () => {
    assert.deepEqual(extractCandidates("Elly De La Cruz managed only one hit in his last three games"), [
      "Elly De La Cruz",
    ])
    assert.deepEqual(extractCandidates("Enmanuel De Los Santos pitched well"), ["Enmanuel De Los Santos"])
  })

  it("does not bridge two names across a sentence boundary", () => {
    assert.deepEqual(extractCandidates("Mike Trout. Mookie Betts homered"), ["Mike Trout", "Mookie Betts"])
  })

  it("keeps apostrophe names intact", () => {
    assert.deepEqual(extractCandidates("Tyler O'Neill went deep"), ["Tyler O'Neill"])
  })

  it("still captures plain two-word names and initials", () => {
    assert.deepEqual(extractCandidates("Mike Trout and J.D. Martinez"), ["Mike Trout", "J.D. Martinez"])
  })

  it("strips a possessive but keeps the suffix", () => {
    assert.deepEqual(extractCandidates("Lourdes Gurriel Jr.'s contract"), ["Lourdes Gurriel Jr."])
  })

  it("does not span newlines", () => {
    assert.deepEqual(extractCandidates("Josh Hader\nEdwin Diaz"), ["Josh Hader", "Edwin Diaz"])
  })

  it("caps candidates at 8", () => {
    const text = "Aa Bb. Cc Dd. Ee Ff. Gg Hh. Ii Jj. Kk Ll. Mm Nn. Oo Pp. Qq Rr. Ss Tt."
    assert.equal(extractCandidates(text).length, 8)
  })
})

describe("resolveKnownPlayers — closed-set linking", () => {
  const set = [
    { name: "Will Klein", id: 691026 },
    { name: "Mookie Betts", id: 605141 },
    { name: "José Ramírez", id: 608070 },
    { name: "Lourdes Gurriel Jr.", id: 542303 },
  ]

  it("links a name even when a word precedes it (the reported bug)", () => {
    assert.deepEqual(resolveKnownPlayers("Claiming Will Klein for $1 is a steal", set), { "Will Klein": 691026 })
  })

  it("links regardless of how many words precede the name", () => {
    assert.deepEqual(resolveKnownPlayers("Top RP Will Klein is available", set), { "Will Klein": 691026 })
    assert.deepEqual(resolveKnownPlayers("Adding Mookie Betts strengthens the OF", set), { "Mookie Betts": 605141 })
  })

  it("does NOT link a player who is not in the known set", () => {
    assert.deepEqual(resolveKnownPlayers("Targeting Aaron Judge would be ideal", set), {})
  })

  it("links a suffixed name and a possessive", () => {
    assert.deepEqual(resolveKnownPlayers("Cutting Lourdes Gurriel Jr.'s contract", set), {
      "Lourdes Gurriel Jr.": 542303,
    })
  })

  it("links accent-mismatched prose via the normalized key", () => {
    assert.deepEqual(resolveKnownPlayers("Jose Ramirez crushed two homers", set), { "José Ramírez": 608070 })
  })

  it("returns nothing for empty text or a missing set", () => {
    assert.deepEqual(resolveKnownPlayers("", set), {})
    assert.deepEqual(resolveKnownPlayers("Will Klein", null), {})
  })
})

describe("matchKey — prose candidate ↔ API fullName", () => {
  it("links a suffixed player", () => {
    assert.equal(links("Lourdes Gurriel Jr.", "Lourdes Gurriel Jr."), true)
  })

  it("links when prose omits the accent the API includes", () => {
    assert.equal(links("Ronald Acuna Jr.", "Ronald Acuña Jr."), true)
    assert.equal(links("Julio Rodriguez", "Julio Rodríguez"), true)
  })

  it("links end-to-end: accented prose → extracted span → API fullName", () => {
    const [span] = extractCandidates("Ronald Acuña Jr. powered the Braves' offense")
    assert.equal(span, "Ronald Acuña Jr.")
    assert.equal(links(span, "Ronald Acuña Jr."), true)
  })

  it("links end-to-end: 4-word surname prose → span → API fullName", () => {
    const [span] = extractCandidates("Elly De La Cruz managed only one hit")
    assert.equal(span, "Elly De La Cruz")
    assert.equal(links(span, "Elly De La Cruz"), true)
  })

  it("links II/III suffixes", () => {
    assert.equal(links("Michael Harris II", "Michael Harris II"), true)
  })

  it("still links plain names and initials (no regression)", () => {
    assert.equal(links("Mike Trout", "Mike Trout"), true)
    assert.equal(links("J.D. Martinez", "J.D. Martinez"), true)
  })

  it("does not link two different players who share a first name", () => {
    assert.equal(links("Josh Hader", "Josh Bell"), false)
  })
})
