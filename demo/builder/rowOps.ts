import { REGISTRY_MAP } from "./registry"
import { COMPOSITE_TYPE, STACK_TYPE, type Block, type Row } from "./types"

// Pure tree operations on Row[]/Block[] — no React, no dnd-kit. Shared by the
// live drag-and-drop UI (Builder.tsx) and the programmatic dev bridge
// (devBridge.ts), so both go through the exact same tree semantics instead of
// risking two implementations drifting apart.

export function uid(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function mkBlock(type: string, props: Record<string, unknown>): Block {
  const def = REGISTRY_MAP.get(type)
  return { id: uid(), type, props, layout: { w: def?.defaultW ?? 12 } }
}

export function mkCompositeInstance(compositeId: string): Block {
  return { id: uid(), type: COMPOSITE_TYPE, compositeId, props: {}, layout: { w: 12 } }
}

export function mkRow(...blocks: Block[]): Row {
  return { id: uid(), blocks }
}

// Deep-clones a Row[] tree, minting brand-new ids at every row/block AND
// every nested stackRows level — a shallow (one-level) version previously
// shipped here and silently left nested containers' ids duplicated after a
// duplicate/ungroup, violating the "ids are unique across the whole tree"
// invariant every lookup function below depends on.
export function cloneRowsWithFreshIds(rows: Row[]): Row[] {
  return rows.map((r) => ({
    id: uid(),
    blocks: r.blocks.map((b) => ({
      ...b,
      id: uid(),
      props: { ...b.props },
      ...(b.stackRows ? { stackRows: cloneRowsWithFreshIds(b.stackRows) } : {}),
    })),
  }))
}

// Every lookup/mutation below recurses into `stackRows` — a stack is just
// another Row[] living inside a block's cell instead of at the top level, so
// the same tree shape (and the same operations) apply at any depth.
export function findBlock(rows: Row[], blockId: string): { block: Block; rowId: string } | null {
  for (const r of rows) {
    const b = r.blocks.find((b) => b.id === blockId)
    if (b) return { block: b, rowId: r.id }
  }
  for (const r of rows) {
    for (const b of r.blocks) {
      if (b.stackRows) {
        const found = findBlock(b.stackRows, blockId)
        if (found) return found
      }
    }
  }
  return null
}

export function findRowDeep(rows: Row[], rowId: string): Row | null {
  for (const r of rows) {
    if (r.id === rowId) return r
  }
  for (const r of rows) {
    for (const b of r.blocks) {
      if (b.stackRows) {
        const found = findRowDeep(b.stackRows, rowId)
        if (found) return found
      }
    }
  }
  return null
}

export function countBlocks(rows: Row[]): number {
  return rows.reduce((n, r) => n + r.blocks.reduce((m, b) => m + 1 + (b.stackRows ? countBlocks(b.stackRows) : 0), 0), 0)
}

// Removing a block can empty out the stack it lived in — prune any STACK_TYPE
// wrapper left with nothing, recursively, so a dangling empty one never
// renders. A real component acting as a container (e.g. Box) is never
// pruned this way: the user placed it deliberately, so an empty Box should
// stay an empty Box, not vanish along with its last child.
export function removeBlock(rows: Row[], blockId: string): Row[] {
  return rows
    .map((r) => ({
      ...r,
      blocks: r.blocks
        .filter((b) => b.id !== blockId)
        .map((b) => (b.stackRows ? { ...b, stackRows: removeBlock(b.stackRows, blockId) } : b))
        .filter((b) => b.type !== STACK_TYPE || !b.stackRows || b.stackRows.length > 0),
    }))
    .filter((r) => r.blocks.length > 0)
}

export function updateBlockDeep(rows: Row[], blockId: string, updater: (b: Block) => Block): Row[] {
  return rows.map((r) => ({
    ...r,
    blocks: r.blocks.map((b) => {
      if (b.id === blockId) return updater(b)
      if (b.stackRows) return { ...b, stackRows: updateBlockDeep(b.stackRows, blockId, updater) }
      return b
    }),
  }))
}

export function updateRowDeep(rows: Row[], rowId: string, updater: (r: Row) => Row): Row[] {
  return rows.map((r) => {
    if (r.id === rowId) return updater(r)
    return { ...r, blocks: r.blocks.map((b) => (b.stackRows ? { ...b, stackRows: updateRowDeep(b.stackRows, rowId, updater) } : b)) }
  })
}

export function duplicateInPlace(rows: Row[], id: string, copy: Block): Row[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!
    const idx = r.blocks.findIndex((b) => b.id === id)
    if (idx !== -1) {
      const blocks = [...r.blocks]
      blocks.splice(idx + 1, 0, copy)
      const next = [...rows]
      next[i] = { ...r, blocks }
      return next
    }
  }
  return recurseIntoStacks(rows, (stackRows) => duplicateInPlace(stackRows, id, copy))
}

// One new row per original row that contributed selected blocks — this is
// what lets "save as component" cover a selection spanning several rows
// (each becomes its own row inside the saved component) while a selection
// that shares one row (e.g. three StatCards side by side) stays side by side.
export function extractSelectedAsRows(rows: Row[], selectedIds: Set<string>): Row[] {
  const groups: Row[] = []
  for (const r of rows) {
    const picked = r.blocks.filter((b) => selectedIds.has(b.id))
    if (picked.length > 0) groups.push(mkRow(...picked.map((b) => ({ ...b, id: uid(), props: { ...b.props } }))))
  }
  return groups
}

export function findFirstSelectedRowId(rows: Row[], selectedIds: Set<string>): string | null {
  for (const r of rows) {
    if (r.blocks.some((b) => selectedIds.has(b.id))) return r.id
  }
  return null
}

// Recurses `fn` into every block's stackRows, one level at a time. Returns
// the ORIGINAL `rows` reference untouched when `fn` finds nothing at any
// depth, so callers can tell "found and handled" from "not here" with a
// plain !== check instead of a deep comparison.
function recurseIntoStacks(rows: Row[], fn: (stackRows: Row[]) => Row[]): Row[] {
  let changed = false
  const next = rows.map((r) => {
    let rowChanged = false
    const blocks = r.blocks.map((b) => {
      if (!b.stackRows) return b
      const updated = fn(b.stackRows)
      if (updated === b.stackRows) return b
      rowChanged = true
      return { ...b, stackRows: updated }
    })
    if (!rowChanged) return r
    changed = true
    return { ...r, blocks }
  })
  return changed ? next : rows
}

export function insertRowRelativeToRow(rows: Row[], newRow: Row, anchorRowId: string, position: "before" | "after"): Row[] {
  const idx = rows.findIndex((r) => r.id === anchorRowId)
  if (idx !== -1) {
    const at = position === "before" ? idx : idx + 1
    const next = [...rows]
    next.splice(at, 0, newRow)
    return next
  }
  return recurseIntoStacks(rows, (stackRows) => insertRowRelativeToRow(stackRows, newRow, anchorRowId, position))
}

export function insertIntoRowRelativeToBlock(rows: Row[], block: Block, anchorBlockId: string, position: "before" | "after"): Row[] {
  for (let i = 0; i < rows.length; i++) {
    const bi = rows[i]!.blocks.findIndex((b) => b.id === anchorBlockId)
    if (bi !== -1) {
      const next = [...rows]
      const blocks = [...next[i]!.blocks]
      blocks.splice(position === "before" ? bi : bi + 1, 0, block)
      next[i] = { ...next[i]!, blocks }
      return next
    }
  }
  const recursed = recurseIntoStacks(rows, (stackRows) => insertIntoRowRelativeToBlock(stackRows, block, anchorBlockId, position))
  return recursed !== rows ? recursed : [...rows, mkRow(block)]
}

// Dropping on the top/bottom edge of a block that SHARES its row with
// siblings can't fairly claim the whole row's width the way it can for a
// solo block — so instead of a new full-width row, it becomes (or extends) a
// stack scoped to just that one column, live and still editable.
export function stackUnderBlock(rows: Row[], newBlock: Block, targetBlockId: string, position: "before" | "after"): Row[] {
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!
    const bi = r.blocks.findIndex((b) => b.id === targetBlockId)
    if (bi !== -1) {
      const target = r.blocks[bi]!
      const blocks = [...r.blocks]
      if (target.type === STACK_TYPE && target.stackRows) {
        const newStackRows = position === "before" ? [mkRow(newBlock), ...target.stackRows] : [...target.stackRows, mkRow(newBlock)]
        blocks[bi] = { ...target, stackRows: newStackRows }
      } else {
        const innerCopy: Block = { ...target, layout: { w: 12 } }
        const selfRow = mkRow(innerCopy)
        const newBlockRow = mkRow(newBlock)
        const stackRows = position === "before" ? [newBlockRow, selfRow] : [selfRow, newBlockRow]
        blocks[bi] = { id: uid(), type: STACK_TYPE, props: {}, layout: { w: target.layout.w }, stackRows }
      }
      const next = [...rows]
      next[i] = { ...r, blocks }
      return next
    }
  }
  return recurseIntoStacks(rows, (stackRows) => stackUnderBlock(stackRows, newBlock, targetBlockId, position))
}

// A block dropped into a container (e.g. Box) becomes one of its own nested
// rows — appended at the start or end of `stackRows`, same shape as the
// top-level canvas so it renders/edits with the exact same machinery.
// updateBlockDeep already recurses into stackRows, so this works for a
// container nested inside another container too.
export function insertIntoContainer(rows: Row[], newBlock: Block, targetBlockId: string, position: "before" | "after"): Row[] {
  return updateBlockDeep(rows, targetBlockId, (b) => {
    const existing = b.stackRows ?? []
    const newRow = mkRow(newBlock)
    return { ...b, stackRows: position === "before" ? [newRow, ...existing] : [...existing, newRow] }
  })
}

export function presetRows(kind: "dashboard" | "stats" | "settings" | "empty"): Row[] {
  if (kind === "stats") {
    return [
      mkRow(mkBlock("PageHeader", { title: "Player overview", subtitle: "Through Tuesday · 24 games", showBack: false })),
      mkRow(
        mkBlock("StatCard", { label: "Batting avg", value: ".312", percentile: 78, invert: false, neutral: false }),
        mkBlock("StatCard", { label: "OPS", value: ".894", percentile: 84, invert: false, neutral: false }),
        mkBlock("StatCard", { label: "ERA", value: "2.87", percentile: 64, invert: true, neutral: false }),
      ),
      mkRow(mkBlock("PercentileGauge", { title: "" })),
    ]
  }
  if (kind === "settings") {
    return [
      mkRow(mkBlock("PageHeader", { title: "Settings", subtitle: "Applies to this device only", showBack: true })),
      mkRow(
        mkBlock("ToggleRow", { label: "Live scores", hint: "Refresh automatically while games are on", checked: true }),
        mkBlock("ToggleRow", { label: "Push notifications", hint: "Final scores and breaking news", checked: false }),
      ),
      mkRow(mkBlock("ChipRow", { chips: "Live:ok, Stale:stale, Cached:muted" })),
      mkRow(mkBlock("Card", { title: "Data feeds", children: "Manage sources in your estate. Tokens control the palette — no hex in props." })),
    ]
  }
  if (kind === "empty") {
    return [
      mkRow(mkBlock("PageHeader", { title: "Nothing here yet", subtitle: "Start with a pattern or drag a block.", showBack: false })),
      mkRow(mkBlock("EmptyState", { icon: "∅", children: "No items to show. The builder starts empty so you can see the empty state you actually ship." })),
    ]
  }
  // dashboard
  return [
    mkRow(mkBlock("PageHeader", { title: "Season summary", subtitle: "Week 14 · through Tuesday", showBack: false })),
    mkRow(mkBlock("Tabs", { tabs: "Summary, Splits, Game log", active: "Summary" })),
    mkRow(
      mkBlock("StatCard", { label: "Batting avg", value: ".312", percentile: 78, invert: false, neutral: false }),
      mkBlock("MatchupCard", { away: "Riverton", home: "Northside", awayScore: 4, homeScore: 6, status: "Final", tone: "final", detail: "WP: Ava Martinez" }),
    ),
    mkRow(mkBlock("DataTable", {})),
    mkRow(mkBlock("DynamicChart", { chartType: "bar", title: "Runs per day" })),
  ]
}
