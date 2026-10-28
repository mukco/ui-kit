import test from "node:test"
import assert from "node:assert/strict"

// panelGeometry reads window.innerHeight only when a bar inset is given.
globalThis.window = { innerHeight: 800, innerWidth: 390 }
const { panelGeometry } = await import("../dist/workbench/FloatingAssistant.js")

test("with no tab bar the panel goes where it was put", () => {
  const g = panelGeometry({ position: { x: 0, y: 500 }, width: 380, height: 400 })
  assert.equal(g.top, 500)
  assert.equal(g.height, 400)
})

test("a shown tab bar keeps the panel above it", () => {
  const g = panelGeometry({ position: { x: 0, y: 500 }, width: 380, height: 400, inset: 82 })
  assert.ok(g.top + g.height <= 800 - 82, `${g.top}+${g.height}`)
})

test("a panel taller than the room above the bar shrinks into it", () => {
  const g = panelGeometry({ position: { x: 0, y: 0 }, width: 380, height: 760, inset: 82 })
  assert.ok(g.top >= 8 && g.top + g.height <= 800 - 82)
})

test("the keyboard's visible height wins over the bar inset", () => {
  const g = panelGeometry({ position: { x: 0, y: 300 }, width: 380, height: 400, available: 420, inset: 82 })
  assert.ok(g.top + g.height <= 420)
})
