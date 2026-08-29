import type { MutableRefObject } from "react"
import { COMPOSITE_TYPE, STACK_TYPE, type Block, type CustomComponent, type PropDef, type Row } from "./types"
import { REGISTRY, REGISTRY_MAP } from "./registry"
import { parseDecls, declsToCss } from "./cssText"
import { generateCode, generateJson } from "./codegen"
import {
  uid,
  mkRow,
  mkCompositeInstance,
  cloneRowsWithFreshIds,
  findBlock,
  findRowDeep,
  countBlocks,
  removeBlock,
  updateBlockDeep,
  duplicateInPlace,
  insertRowRelativeToRow,
  insertIntoRowRelativeToBlock,
  stackUnderBlock,
  insertIntoContainer,
  presetRows,
} from "./rowOps"

// A small, dev-only API exposed as `window.__uiKitBuilder` so an LLM driving
// a live tab through browser-automation tools (it can't see pixels, only
// call functions and read structured results) can build/edit a page the
// same way the drag-and-drop UI does, and a human can keep editing by hand
// in the same tab afterward — both sides share the exact same `rows` state,
// so this is live and bidirectional by construction, not a one-shot export.

export type BridgeResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string }

export type SerializedComponentDef = {
  type: string
  label: string
  category: string
  icon: string
  container: boolean
  defaultW: number
  defaults: Record<string, unknown>
  propDefs: PropDef[]
}

// Deliberately id-less — the bridge always mints ids and hands them back in
// the result. No method anywhere accepts a caller-supplied id: that sidesteps
// the (pre-existing, unenforced elsewhere) global-id-uniqueness invariant
// every tree lookup in rowOps.ts depends on.
export type NewBlockSpec = {
  type: string // a REGISTRY_MAP key, or the STACK_TYPE sentinel ("__stack__")
  props?: Record<string, unknown> // merged OVER the type's registry defaults
  w?: number
  customCss?: string
  compositeId?: string // set INSTEAD of type/props/stack — a saved-component instance
  stack?: NewRowSpec[] // nested rows — only for STACK_TYPE or a container:true type (e.g. Box)
}
export type NewRowSpec = { blocks: NewBlockSpec[] }

export type InsertTarget =
  | { kind: "end" }
  | { kind: "row-before" | "row-after"; anchorRowId: string }
  | { kind: "row-sibling-before" | "row-sibling-after"; anchorBlockId: string }
  | { kind: "stack-before" | "stack-after"; targetBlockId: string }
  | { kind: "container-start" | "container-end"; containerBlockId: string }

export interface UiKitBuilderBridge {
  ping(): { ready: true; version: string }

  listComponents(): SerializedComponentDef[]
  listCustomComponents(): Array<{ id: string; name: string; icon: string }>
  getCustomComponent(compositeId: string): { rows: Row[] } | null

  getPage(): { rows: Row[]; blockCount: number }
  // The exact JSX/JSON text a person gets from the code panel's Copy button —
  // real component names, real props, real imports, ready to paste. `rows`
  // alone (from getPage) is the data model, not this — don't hand-reconstruct
  // JSX from it when this exists to do that correctly, including composite
  // and stack expansion.
  getGeneratedCode(): { jsx: string; json: string }
  getBlock(blockId: string): (Block & { rowId: string }) | null
  getSelection(): { selectedId: string | null; multiSelectIds: string[] }

  insertBlock(spec: NewBlockSpec, target: InsertTarget): BridgeResult<{ blockId: string; rowId?: string }>
  duplicateBlock(blockId: string): BridgeResult<{ blockId: string }>
  removeBlock(blockId: string): BridgeResult
  ungroupComposite(blockId: string): BridgeResult<{ blockIds: string[] }>
  saveSelectionAsComponent(blockIds: string[], name: string): BridgeResult<{ compositeId: string; blockId: string }>

  updateProps(blockId: string, props: Record<string, unknown>): BridgeResult
  setWidth(blockId: string, w: number): BridgeResult
  setHeight(blockId: string, px: number): BridgeResult
  setCustomCss(blockId: string, css: string): BridgeResult

  applyPreset(kind: "dashboard" | "stats" | "settings" | "empty"): BridgeResult<{ rows: Row[] }>
  setPage(rows: NewRowSpec[]): BridgeResult<{ rows: Row[] }>
  clearPage(): BridgeResult

  undo(): BridgeResult
  redo(): BridgeResult
  canUndo(): boolean
  canRedo(): boolean
}

declare global {
  interface Window {
    __uiKitBuilder?: UiKitBuilderBridge
  }
}

// Everything the bridge needs to read/act on "whatever the Builder's state
// is right now" — assembled fresh into a ref on every render (see Builder.tsx).
// `rowsRef`/`customComponentsRef` are passed as the REF OBJECTS themselves
// (not their dereferenced .current values) and read via `.current` at call
// time in every method below — reading a dereferenced value here instead
// would bake in a snapshot from whatever render last ran, which goes stale
// the instant two bridge calls happen back-to-back in the same script tick
// (React doesn't re-render synchronously between them).
export type LatestBuilderState = {
  rowsRef: MutableRefObject<Row[]>
  customComponentsRef: MutableRefObject<CustomComponent[]>
  setRows: (updater: Row[] | ((prev: Row[]) => Row[])) => void
  setCustomComponents: (updater: CustomComponent[] | ((prev: CustomComponent[]) => CustomComponent[])) => void
  selectedId: string | null
  multiSelectIds: Set<string>
  undo: () => void
  redo: () => void
  undoStack: MutableRefObject<Row[][]>
  redoStack: MutableRefObject<Row[][]>
  baselineRef: MutableRefObject<Row[]>
  saveAsComponentCore: (blockIds: Set<string>, name: string) => { compositeId: string; blockId: string } | null
  clearRows: () => void
}

type MintResult = { ok: true; block: Block } | { ok: false; error: string }
type MintRowResult = { ok: true; row: Row } | { ok: false; error: string }

function mintBlock(spec: NewBlockSpec, customComponents: CustomComponent[], path: string): MintResult {
  if (spec.compositeId) {
    if (spec.type || spec.stack) return { ok: false, error: `${path}: compositeId cannot be combined with type/stack` }
    if (!customComponents.some((c) => c.id === spec.compositeId)) {
      return { ok: false, error: `${path}: unknown compositeId "${spec.compositeId}" — call listCustomComponents()` }
    }
    return { ok: true, block: mkCompositeInstance(spec.compositeId) }
  }

  if (!spec.type) return { ok: false, error: `${path}: missing "type" (or "compositeId")` }
  const isStack = spec.type === STACK_TYPE
  const def = isStack ? undefined : REGISTRY_MAP.get(spec.type)
  if (!isStack && !def) return { ok: false, error: `${path}: unknown component type "${spec.type}" — call listComponents()` }
  if (isStack && (!spec.stack || spec.stack.length === 0)) {
    return { ok: false, error: `${path}: "${STACK_TYPE}" requires at least one row in "stack"` }
  }
  if (spec.stack && !isStack && !def?.container) {
    return { ok: false, error: `${path}: type "${spec.type}" cannot contain nested blocks` }
  }

  let stackRows: Row[] | undefined
  if (spec.stack) {
    const rows: Row[] = []
    for (let i = 0; i < spec.stack.length; i++) {
      const result = mintRow(spec.stack[i]!, customComponents, `${path}.stack[${i}]`)
      if (!result.ok) return result
      rows.push(result.row)
    }
    stackRows = rows
  }

  const block: Block = {
    id: uid(),
    type: spec.type,
    props: isStack ? {} : { ...(def?.defaults ?? {}), ...(spec.props ?? {}) },
    layout: { w: spec.w ?? def?.defaultW ?? 12 },
    ...(spec.customCss ? { customCss: spec.customCss } : {}),
    ...(stackRows ? { stackRows } : {}),
  }
  return { ok: true, block }
}

function mintRow(spec: NewRowSpec, customComponents: CustomComponent[], path: string): MintRowResult {
  if (!spec.blocks || spec.blocks.length === 0) return { ok: false, error: `${path}: row needs at least one block` }
  const blocks: Block[] = []
  for (let i = 0; i < spec.blocks.length; i++) {
    const result = mintBlock(spec.blocks[i]!, customComponents, `${path}.blocks[${i}]`)
    if (!result.ok) return result
    blocks.push(result.block)
  }
  return { ok: true, row: { id: uid(), blocks } }
}

export function createDevBridge(ref: MutableRefObject<LatestBuilderState>): UiKitBuilderBridge {
  return {
    ping: () => ({ ready: true, version: "1" }),

    listComponents: () =>
      REGISTRY.map((def) => ({
        type: def.type,
        label: def.label,
        category: def.category,
        icon: def.icon,
        container: Boolean(def.container),
        defaultW: def.defaultW,
        defaults: def.defaults,
        propDefs: def.propDefs,
      })),

    listCustomComponents: () => ref.current.customComponentsRef.current.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),

    getCustomComponent: (compositeId) => {
      const found = ref.current.customComponentsRef.current.find((c) => c.id === compositeId)
      return found ? { rows: found.rows } : null
    },

    getPage: () => ({ rows: ref.current.rowsRef.current, blockCount: countBlocks(ref.current.rowsRef.current) }),

    getGeneratedCode: () => {
      const latest = ref.current
      const { code } = generateCode(latest.rowsRef.current, latest.customComponentsRef.current)
      return { jsx: code, json: generateJson(latest.rowsRef.current) }
    },

    getBlock: (blockId) => {
      const found = findBlock(ref.current.rowsRef.current, blockId)
      return found ? { ...found.block, rowId: found.rowId } : null
    },

    getSelection: () => ({ selectedId: ref.current.selectedId, multiSelectIds: [...ref.current.multiSelectIds] }),

    insertBlock: (spec, target) => {
      const latest = ref.current
      const minted = mintBlock(spec, latest.customComponentsRef.current, "block")
      if (!minted.ok) return { ok: false, error: minted.error }
      const block = minted.block

      let rows = latest.rowsRef.current
      let rowId: string | undefined

      switch (target.kind) {
        case "end": {
          const row = mkRow(block)
          rows = [...rows, row]
          rowId = row.id
          break
        }
        case "row-before":
        case "row-after": {
          if (!findRowDeep(rows, target.anchorRowId)) return { ok: false, error: `no row with id "${target.anchorRowId}"` }
          const row = mkRow(block)
          rows = insertRowRelativeToRow(rows, row, target.anchorRowId, target.kind === "row-before" ? "before" : "after")
          rowId = row.id
          break
        }
        case "row-sibling-before":
        case "row-sibling-after": {
          const anchor = findBlock(rows, target.anchorBlockId)
          if (!anchor) return { ok: false, error: `no block with id "${target.anchorBlockId}"` }
          rows = insertIntoRowRelativeToBlock(rows, block, target.anchorBlockId, target.kind === "row-sibling-before" ? "before" : "after")
          rowId = anchor.rowId
          break
        }
        case "stack-before":
        case "stack-after": {
          if (!findBlock(rows, target.targetBlockId)) return { ok: false, error: `no block with id "${target.targetBlockId}"` }
          rows = stackUnderBlock(rows, block, target.targetBlockId, target.kind === "stack-before" ? "before" : "after")
          break
        }
        case "container-start":
        case "container-end": {
          const found = findBlock(rows, target.containerBlockId)
          if (!found) return { ok: false, error: `no block with id "${target.containerBlockId}"` }
          const isContainer = found.block.type === STACK_TYPE || Boolean(REGISTRY_MAP.get(found.block.type)?.container)
          if (!isContainer) return { ok: false, error: `block "${target.containerBlockId}" is not a container` }
          rows = insertIntoContainer(rows, block, target.containerBlockId, target.kind === "container-start" ? "before" : "after")
          break
        }
      }

      latest.setRows(rows)
      return { ok: true, blockId: block.id, rowId }
    },

    duplicateBlock: (blockId) => {
      const latest = ref.current
      const src = findBlock(latest.rowsRef.current, blockId)
      if (!src) return { ok: false, error: `no block with id "${blockId}"` }
      const copy: Block = {
        id: uid(),
        type: src.block.type,
        props: { ...src.block.props },
        layout: { ...src.block.layout },
        compositeId: src.block.compositeId,
        customCss: src.block.customCss,
        ...(src.block.stackRows ? { stackRows: cloneRowsWithFreshIds(src.block.stackRows) } : {}),
      }
      latest.setRows(duplicateInPlace(latest.rowsRef.current, blockId, copy))
      return { ok: true, blockId: copy.id }
    },

    removeBlock: (blockId) => {
      const latest = ref.current
      if (!findBlock(latest.rowsRef.current, blockId)) return { ok: false, error: `no block with id "${blockId}"` }
      latest.setRows(removeBlock(latest.rowsRef.current, blockId))
      return { ok: true }
    },

    ungroupComposite: (blockId) => {
      const latest = ref.current
      const src = findBlock(latest.rowsRef.current, blockId)
      if (!src || src.block.type !== COMPOSITE_TYPE) return { ok: false, error: `block "${blockId}" is not a saved-component instance` }
      const composite = latest.customComponentsRef.current.find((c) => c.id === src.block.compositeId)
      if (!composite) return { ok: false, error: `composite "${src.block.compositeId}" not found` }
      const cloned = cloneRowsWithFreshIds(composite.rows)
      const rows = latest.rowsRef.current
      const idx = rows.findIndex((r) => r.id === src.rowId)
      if (idx === -1) return { ok: false, error: `row "${src.rowId}" not found` }
      const row = rows[idx]!
      const remaining = row.blocks.filter((b) => b.id !== blockId)
      const next = remaining.length > 0
        ? [...rows.slice(0, idx), { ...row, blocks: remaining }, ...cloned, ...rows.slice(idx + 1)]
        : [...rows.slice(0, idx), ...cloned, ...rows.slice(idx + 1)]
      latest.setRows(next)
      return { ok: true, blockIds: cloned.flatMap((r) => r.blocks.map((b) => b.id)) }
    },

    saveSelectionAsComponent: (blockIds, name) => {
      const latest = ref.current
      if (!name.trim()) return { ok: false, error: "name is required" }
      const idSet = new Set(blockIds)
      for (const id of idSet) {
        if (!findBlock(latest.rowsRef.current, id)) return { ok: false, error: `no block with id "${id}"` }
      }
      const result = latest.saveAsComponentCore(idSet, name)
      if (!result) return { ok: false, error: "selection produced no rows" }
      return { ok: true, ...result }
    },

    updateProps: (blockId, props) => {
      const latest = ref.current
      if (!findBlock(latest.rowsRef.current, blockId)) return { ok: false, error: `no block with id "${blockId}"` }
      latest.setRows(updateBlockDeep(latest.rowsRef.current, blockId, (b) => ({ ...b, props: { ...b.props, ...props } })))
      return { ok: true }
    },

    setWidth: (blockId, w) => {
      const latest = ref.current
      if (!findBlock(latest.rowsRef.current, blockId)) return { ok: false, error: `no block with id "${blockId}"` }
      latest.setRows(updateBlockDeep(latest.rowsRef.current, blockId, (b) => ({ ...b, layout: { w } })))
      return { ok: true }
    },

    setHeight: (blockId, px) => {
      const latest = ref.current
      if (!findBlock(latest.rowsRef.current, blockId)) return { ok: false, error: `no block with id "${blockId}"` }
      latest.setRows(updateBlockDeep(latest.rowsRef.current, blockId, (b) => {
        const decls = parseDecls(b.customCss ?? "").filter((d) => d.prop.trim().toLowerCase() !== "min-height")
        decls.push({ prop: "min-height", value: `${px}px` })
        return { ...b, customCss: declsToCss(decls) }
      }))
      return { ok: true }
    },

    setCustomCss: (blockId, css) => {
      const latest = ref.current
      if (!findBlock(latest.rowsRef.current, blockId)) return { ok: false, error: `no block with id "${blockId}"` }
      latest.setRows(updateBlockDeep(latest.rowsRef.current, blockId, (b) => ({ ...b, customCss: css })))
      return { ok: true }
    },

    applyPreset: (kind) => {
      const next = presetRows(kind)
      ref.current.setRows(next)
      return { ok: true, rows: next }
    },

    setPage: (rowSpecs) => {
      const latest = ref.current
      const rows: Row[] = []
      for (let i = 0; i < rowSpecs.length; i++) {
        const result = mintRow(rowSpecs[i]!, latest.customComponentsRef.current, `rows[${i}]`)
        if (!result.ok) return { ok: false, error: result.error }
        rows.push(result.row)
      }
      latest.setRows(rows)
      return { ok: true, rows }
    },

    clearPage: () => {
      ref.current.clearRows()
      return { ok: true }
    },

    undo: () => {
      ref.current.undo()
      return { ok: true }
    },

    redo: () => {
      ref.current.redo()
      return { ok: true }
    },

    canUndo: () => {
      const latest = ref.current
      return latest.undoStack.current.length > 0 || latest.baselineRef.current !== latest.rowsRef.current
    },

    canRedo: () => ref.current.redoStack.current.length > 0,
  }
}
