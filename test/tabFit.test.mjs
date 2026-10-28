import test from "node:test"
import assert from "node:assert/strict"
import { fitTabs, moreSections, shownTabs, slotWidth } from "../dist/primitives/tabFit.js"

// Frame widths roughly as Phosphor draws them at 390 with the phone's +2px:
// Today, Fantasy, Teams, Stats, News, Picks, Sim, Sandbox, Settings.
const W = [58, 66, 58, 54, 50, 50, 42, 66, 70]
const MORE = 50
const GAP = 4
const base = { widths: W, moreWidth: MORE, gap: GAP, here: 0, alwaysMore: true }

const fits = (k, room, here = 0, widths = W) =>
  shownTabs(widths.length, k, here).every((i) => widths[i] <= slotWidth(room, GAP, k + 1)) && MORE <= slotWidth(room, GAP, k + 1)

test("slots share the room evenly, More included", () => {
  assert.equal(slotWidth(374, 4, 5), 71.6)
  // Every slot the same: k tabs + More fill the room exactly.
  const k = fitTabs({ ...base, room: 374 })
  const slot = slotWidth(374, GAP, k + 1)
  assert.ok(Math.abs(slot * (k + 1) + GAP * k - 374) < 1e-9)
})

test("shows the most tabs whose labels fit whole, never one more", () => {
  for (const room of [344, 359, 374, 414]) {
    const k = fitTabs({ ...base, room })
    assert.ok(fits(k, room), `room ${room}: ${k} tabs should fit`)
    if (k < W.length) assert.ok(!fits(k + 1, room), `room ${room}: ${k + 1} tabs should not fit`)
  }
})

test("a narrower screen holds no more tabs than a wider one", () => {
  const counts = [300, 344, 359, 374, 414, 600].map((room) => fitTabs({ ...base, room }))
  for (let i = 1; i < counts.length; i++) assert.ok(counts[i] >= counts[i - 1], counts.join(","))
})

test("larger text holds fewer tabs, and every shown label still fits its slot", () => {
  const bigger = W.map((w) => w + 18) // +3px text size on nine-character labels
  const k = fitTabs({ ...base, widths: bigger, moreWidth: MORE + 12, room: 374 })
  assert.ok(k < fitTabs({ ...base, room: 374 }))
  const slot = slotWidth(374, GAP, k + 1)
  for (const i of shownTabs(W.length, k, 0)) assert.ok(bigger[i] <= slot)
  assert.ok(MORE + 12 <= slot)
})

test("the current page's tab is always shown, in the last slot when it would have overflowed", () => {
  const k = fitTabs({ ...base, room: 374, here: 8 })
  const shown = shownTabs(W.length, k, 8)
  assert.ok(shown.includes(8))
  assert.equal(shown[shown.length - 1], 8)
  assert.deepEqual(shown.slice(0, -1), [...Array(k - 1).keys()])
})

test("a wide current tab can cost a slot, and the next page gets it back", () => {
  const widths = [50, 50, 50, 50, 50, 50, 90]
  const room = 4 * 72 + 4 * GAP + 70 // room for four 72px slots plus More
  const onWide = fitTabs({ ...base, widths, room, here: 6 })
  const onNarrow = fitTabs({ ...base, widths, room, here: 0 })
  assert.ok(onWide < onNarrow, `${onWide} < ${onNarrow}`)
})

test("every tab, no More, when they all fit and the app has nothing else under More", () => {
  assert.equal(fitTabs({ ...base, widths: [50, 50, 50], room: 374, alwaysMore: false }), 3)
  assert.equal(fitTabs({ ...base, widths: [50, 50, 50], room: 374, alwaysMore: true }), 3)
})

test("never fewer than one tab, never a slot under the 44px target", () => {
  assert.equal(fitTabs({ ...base, room: 60 }), 1)
  const k = fitTabs({ ...base, widths: W.map(() => 20), moreWidth: 20, room: 300 })
  assert.ok(slotWidth(300, GAP, k + 1) >= 44)
})

test("an unmeasured bar (hidden: no room) shows every tab", () => {
  assert.equal(fitTabs({ ...base, room: 0 }), W.length)
})

const T = (to, label, match = [to]) => ({ to, label, match })

test("More's sheet: the tabs that did not fit first, under one heading, then the app's groups", () => {
  const tabs = [T("/", "Today", ["/", "/game"]), T("/news", "News"), T("/sim", "Sim")]
  const items = [
    { to: "/digest", label: "Stat Blast", group: "News" },
    { to: "/news", label: "News", group: "News" }, // also a tab: dropped
    { to: "/ref", label: "Reference", group: "Definitions" },
  ]
  const s = moreSections(tabs.slice(1), items, tabs, "/", "Sections")
  assert.deepEqual(s.map((x) => [x.heading, x.entries.map((e) => e.label)]), [
    ["Sections", ["News", "Sim"]],
    ["News", ["Stat Blast"]],
    ["Definitions", ["Reference"]],
  ])
})

test("an ungrouped item is a section of its own, never part of the run above it", () => {
  const s = moreSections([T("/sim", "Sim")], [{ to: "/x", label: "X" }], [T("/sim", "Sim")], "/", "Sections")
  assert.equal(s.length, 2)
  assert.equal(s[1].heading, undefined)
  assert.deepEqual(s[1].entries.map((e) => e.label), ["X"])
})

test("a sheet row is current by the tab's own match, or the item's path", () => {
  const s = moreSections([T("/", "Today", ["/", "/game"])], [{ to: "/digest", label: "Stat Blast", group: "News" }], [], "/game/12", "Sections")
  assert.equal(s[0].entries[0].here, true)
  assert.equal(s[1].entries[0].here, false)
  assert.equal(moreSections([], [{ to: "/digest", label: "Stat Blast" }], [], "/digest/3", "Sections")[0].entries[0].here, true)
})
