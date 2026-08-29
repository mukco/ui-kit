import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
} from "@dnd-kit/core"
import { Button } from "../../src"
import { ThemeToggle } from "../../src/primitives/ThemeToggle"
import { Palette } from "./Palette"
import { Canvas } from "./Canvas"
import { Inspector } from "./Inspector"
import { CodePanel } from "./CodePanel"
import { REGISTRY_MAP } from "./registry"
import { parseDecls, declsToCss } from "./cssText"
import { COMPOSITE_TYPE, STACK_TYPE, type Block, type CustomComponent, type Row } from "./types"
import {
  uid,
  mkBlock,
  mkCompositeInstance,
  mkRow,
  cloneRowsWithFreshIds,
  findBlock,
  findRowDeep,
  countBlocks,
  removeBlock,
  updateBlockDeep,
  updateRowDeep,
  duplicateInPlace,
  extractSelectedAsRows,
  findFirstSelectedRowId,
  insertRowRelativeToRow,
  insertIntoRowRelativeToBlock,
  stackUnderBlock,
  insertIntoContainer,
  presetRows,
} from "./rowOps"
import { createDevBridge, type LatestBuilderState, type UiKitBuilderBridge } from "./devBridge"
import "./builder.css"

const LS_KEY = "ui-kit-builder:v2"
const COMPONENTS_LS_KEY = "ui-kit-builder:components:v1"

function loadCustomComponents(): CustomComponent[] {
  try {
    const raw = localStorage.getItem(COMPONENTS_LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return parsed as CustomComponent[]
    }
  } catch { /* ignore */ }
  return []
}

function firstBlockId(rows: Row[]): string | null {
  return rows[0]?.blocks[0]?.id ?? null
}

type DropZone = "before-row" | "after-row" | "before-in-row" | "after-in-row"

// Which quadrant of a drop target the pointer is over decides the outcome —
// top/bottom picks a new row before/after the target's row, left/right joins
// the target's own row. Using the whole block (not a sliver between blocks)
// as the hit target is what makes drops forgiving for a real mouse.
// In the mobile preview every row is forced to stack full-width anyway, so
// "join a row" would silently do nothing visible — only offer before/after.
// A container target (e.g. Box) can't "join a row" the way two siblings
// share one — dropping on its middle means "put this inside," and since its
// own contents stack vertically, that middle split is top/bottom too.
function resolveDropZone(pointer: { x: number; y: number }, overRect: { top: number; left: number; width: number; height: number }, stacked: boolean, container: boolean): DropZone {
  const relY = (pointer.y - overRect.top) / overRect.height
  if (stacked) return relY < 0.5 ? "before-row" : "after-row"
  // Thin edge strips for "new row" — dropping anywhere on the bulk of the
  // component reads as "put it next to this," matching what dropping ON a
  // thing suggests. Only aiming near its top/bottom edge starts a new row.
  // A pure 15% cut goes unhittable on a short block (a one-line Button is
  // ~50px tall, so 15% is a 7-8px sliver) — floor it to a real pixel size,
  // capped so a very short block still keeps a usable middle zone too.
  const MIN_EDGE_PX = 14
  const edge = Math.min(0.4, Math.max(0.15, MIN_EDGE_PX / overRect.height))
  if (relY < edge) return "before-row"
  if (relY > 1 - edge) return "after-row"
  if (container) return relY < 0.5 ? "before-in-row" : "after-in-row"
  const relX = (pointer.x - overRect.left) / overRect.width
  return relX < 0.5 ? "before-in-row" : "after-in-row"
}

// Plain-language description of what a drop at this zone will actually do —
// drives the live label shown on the active drop zone during a drag, so the
// user sees the outcome before releasing instead of guessing from geometry.
function describeDrop(base: Row[], targetBlockId: string, zone: DropZone): string {
  const target = findBlock(base, targetBlockId)
  if (!target) return ""
  if (zone === "before-row" || zone === "after-row") {
    const targetRow = findRowDeep(base, target.rowId)
    const shared = (targetRow?.blocks.length ?? 1) > 1
    if (zone === "before-row") return shared ? "Stack above, in this column" : "New row above"
    return shared ? "Stack below, in this column" : "New row below"
  }
  const isContainer = Boolean(REGISTRY_MAP.get(target.block.type)?.container)
  if (isContainer) return zone === "before-in-row" ? "Add inside, at the top" : "Add inside, at the bottom"
  return zone === "before-in-row" ? "Share this row, on the left" : "Share this row, on the right"
}

// The dragged node's own translated rect isn't the pointer position — it's
// offset by wherever within the node the user originally grabbed it (here,
// always the top-center handle, never the node's center). Reconstruct the
// true pointer position from the original activation event plus the drag's
// accumulated delta instead.
// A keyboard-initiated drag has no pointer at all — its activatorEvent is a
// KeyboardEvent, not a PointerEvent/MouseEvent. There the dragged node's
// translated center genuinely IS the right reference: the keyboard sensor
// moves the whole rect by fixed steps with no arbitrary grab-point offset,
// so falling back to it (rather than bailing out) is what lets a keyboard
// drag actually complete a drop instead of silently doing nothing.
function pointerFromEvent(e: DragEndEvent | DragMoveEvent): { x: number; y: number } | null {
  const activator = e.activatorEvent
  if (activator instanceof PointerEvent || activator instanceof MouseEvent) {
    return { x: activator.clientX + e.delta.x, y: activator.clientY + e.delta.y }
  }
  const rect = e.active.rect.current.translated
  if (!rect) return null
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

// Older saved state (pre-row builder) predates this shape entirely — just discard it.
function isRowArray(v: unknown): v is Row[] {
  return Array.isArray(v) && v.every((r) => r && Array.isArray((r as Row).blocks))
}

function loadInitial(): Row[] {
  try {
    const hash = location.hash.startsWith("#b=") ? location.hash.slice(3) : ""
    if (hash) {
      const decoded = JSON.parse(atob(hash)) as unknown
      if (isRowArray(decoded) && decoded.length > 0) return decoded
    }
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (isRowArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return [
    mkRow(mkBlock("PageHeader", { title: "Your page", subtitle: "Drag components from the left to build.", showBack: false })),
    mkRow(
      mkBlock("StatCard", { label: "Batting avg", value: ".312", percentile: 78, invert: false, neutral: false }),
      mkBlock("Card", { title: "Hello", children: "Every block is a real kit component — select to edit, drag ⠿ to reorder. Drop one block onto another to share a row, drag the divider to rebalance." }),
    ),
  ]
}

export function Builder() {
  const [rows, setRowsState] = useState<Row[]>(() => loadInitial())
  // React state setters aren't guaranteed to run their updater synchronously,
  // so two bridge calls issued back-to-back in the same script tick (e.g.
  // `setPage(...)` immediately followed by `insertBlock(...)`) could each see
  // the SAME pre-update `rows` if they only read closured state — the second
  // call would silently act on stale data. `rowsRef` is this component's own
  // synchronously-authoritative shadow: every `setRows` call computes `next`
  // itself (from `rowsRef.current`, not React's `prev`) and stashes it here
  // immediately, before handing the concrete value to React to actually
  // re-render. Every existing call site keeps calling `setRows(...)` exactly
  // as before — only what `setRows` resolves to changes.
  const rowsRef = useRef<Row[]>(rows)
  function setRows(updater: Row[] | ((prev: Row[]) => Row[])) {
    const next = typeof updater === "function" ? (updater as (prev: Row[]) => Row[])(rowsRef.current) : updater
    rowsRef.current = next
    setRowsState(next)
  }

  const [selectedId, setSelectedId] = useState<string | null>(() => firstBlockId(rows))
  const [multiSelectIds, setMultiSelectIds] = useState<Set<string>>(new Set())
  const [customComponents, setCustomComponentsState] = useState<CustomComponent[]>(() => loadCustomComponents())
  const customComponentsRef = useRef<CustomComponent[]>(customComponents)
  function setCustomComponents(updater: CustomComponent[] | ((prev: CustomComponent[]) => CustomComponent[])) {
    const next = typeof updater === "function" ? (updater as (prev: CustomComponent[]) => CustomComponent[])(customComponentsRef.current) : updater
    customComponentsRef.current = next
    setCustomComponentsState(next)
  }

  const [search, setSearch] = useState("")
  const [activeDrag, setActiveDrag] = useState<{ kind: "palette" | "block"; type?: string; compositeId?: string; block?: Block } | null>(null)
  const [dropHint, setDropHint] = useState<{ blockId: string; zone: DropZone; label: string } | null>(null)
  const [showInspectorMobile, setShowInspectorMobile] = useState(false)
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")
  const [codeHeight, setCodeHeight] = useState(240)
  const [shareCopied, setShareCopied] = useState(false)

  // Undo/redo: a single time-debounced watcher on `rows` covers every kind of
  // edit uniformly (structural moves, resize drags, prop/CSS edits) instead
  // of hand-instrumenting every call site — a resize drag fires dozens of
  // rows updates a second, so checkpointing only after ~500ms of quiet
  // collapses a whole gesture into one undo step instead of one per pixel.
  const HISTORY_DEBOUNCE_MS = 500
  const undoStack = useRef<Row[][]>([])
  const redoStack = useRef<Row[][]>([])
  const baselineRef = useRef<Row[]>(rows)
  const skipCheckpointRef = useRef(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, bumpHistoryVersion] = useReducer((c: number) => c + 1, 0)

  useEffect(() => {
    if (skipCheckpointRef.current) {
      skipCheckpointRef.current = false
      baselineRef.current = rows
      return
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      if (baselineRef.current !== rows) {
        undoStack.current.push(baselineRef.current)
        if (undoStack.current.length > 40) undoStack.current.shift()
        redoStack.current = []
        baselineRef.current = rows
        bumpHistoryVersion()
      }
    }, HISTORY_DEBOUNCE_MS)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [rows])

  // The slideout Inspector is a small-screen affordance — the desktop sidebar
  // (same breakpoint, in builder.css) is already always visible there, so
  // popping the overlay on top of it would cover the canvas with its backdrop
  // for no reason and block seeing live edits (or dragging) underneath.
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia("(max-width: 960px)").matches)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)")
    const onChange = () => setIsNarrow(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const found = useMemo(() => (selectedId ? findBlock(rows, selectedId) : null), [rows, selectedId])
  const selectedBlock = found?.block ?? null
  const selectedComposite = selectedBlock?.type === COMPOSITE_TYPE ? (customComponents.find((c) => c.id === selectedBlock.compositeId) ?? null) : null
  const selectedDef = selectedComposite
    ? { type: "Your component", label: selectedComposite.name, category: "Component", icon: selectedComposite.icon, defaults: {}, propDefs: [], imports: [], defaultW: 12, render: () => null, code: () => "" }
    : selectedBlock?.type === STACK_TYPE
      ? { type: "Stack", label: "Stack", category: "Layout", icon: "▤", defaults: {}, propDefs: [], imports: [], defaultW: 12, render: () => null, code: () => "" }
      : selectedBlock
        ? (REGISTRY_MAP.get(selectedBlock.type) ?? null)
        : null

  useEffect(() => {
    try {
      localStorage.setItem(COMPONENTS_LS_KEY, JSON.stringify(customComponents))
    } catch { /* ignore */ }
  }, [customComponents])

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(rows))
      const encoded = btoa(JSON.stringify(rows))
      const url = `${location.pathname}#b=${encoded}`
      history.replaceState(null, "", url)
    } catch { /* ignore */ }
  }, [rows])

  // Keyboard: delete / duplicate / undo / redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        undo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault()
        if (selectedId) duplicate(selectedId)
        return
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        e.preventDefault()
        remove(selectedId)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedId, rows])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  function undo() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    // Flush whatever's pending so undo always reverts the most recent edit,
    // even one still inside its debounce window (e.g. mid-resize-drag).
    // Reads rowsRef, not the closured `rows` state — this function is a
    // fresh closure each render, so calling it via the dev bridge right after
    // a synchronous bridge mutation (same tick, before React re-renders)
    // would otherwise still see the PRE-mutation `rows` here.
    if (baselineRef.current !== rowsRef.current) {
      undoStack.current.push(baselineRef.current)
      baselineRef.current = rowsRef.current
    }
    const prev = undoStack.current.pop()
    if (!prev) return
    redoStack.current.push(rowsRef.current)
    skipCheckpointRef.current = true
    setRows(prev)
    setSelectedId(firstBlockId(prev))
    bumpHistoryVersion()
  }

  function redo() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push(rowsRef.current)
    baselineRef.current = rowsRef.current
    skipCheckpointRef.current = true
    setRows(next)
    setSelectedId(firstBlockId(next))
    bumpHistoryVersion()
  }

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    if (id.startsWith("palette-")) {
      const data = e.active.data.current as { componentType?: string; compositeId?: string } | undefined
      if (data?.compositeId) setActiveDrag({ kind: "palette", compositeId: data.compositeId })
      else setActiveDrag({ kind: "palette", type: String(data?.componentType ?? id.slice(8)) })
    } else {
      setActiveDrag({ kind: "block", block: findBlock(rows, id)?.block })
    }
  }

  // Live preview of what a drop would do right now — recomputed on every
  // pointer move so the highlighted zone (see Canvas/DraggableBlock) always
  // matches what handleDragEnd would actually resolve to on release.
  function handleDragMove(e: DragMoveEvent) {
    const { over } = e
    if (!over || !String(over.id).startsWith("block-")) {
      setDropHint(null)
      return
    }
    const targetBlockId = String(over.id).slice("block-".length)
    const target = findBlock(rows, targetBlockId)
    const pointer = pointerFromEvent(e)
    if (!target || !pointer) {
      setDropHint(null)
      return
    }
    const targetIsContainer = Boolean(REGISTRY_MAP.get(target.block.type)?.container)
    const zone = resolveDropZone(pointer, over.rect, viewport === "mobile", targetIsContainer)
    setDropHint({ blockId: targetBlockId, zone, label: describeDrop(rows, targetBlockId, zone) })
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveDrag(null)
    setDropHint(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const isPalette = activeId.startsWith("palette-")

    let movingBlock: Block
    let base: Row[]

    if (isPalette) {
      const data = active.data.current as { componentType?: string; compositeId?: string } | undefined
      if (data?.compositeId) {
        movingBlock = mkCompositeInstance(data.compositeId)
      } else {
        const type = String(data?.componentType ?? activeId.slice(8))
        const def = REGISTRY_MAP.get(type)
        if (!def) return
        movingBlock = mkBlock(type, { ...def.defaults })
      }
      base = rows
    } else {
      if (overId === `block-${activeId}`) return // dropped on itself — no-op
      const src = findBlock(rows, activeId)
      if (!src) return
      movingBlock = src.block
      base = removeBlock(rows, activeId)
    }

    let next: Row[]
    if (overId === "canvas-end") {
      next = [...base, mkRow(movingBlock)]
    } else if (overId.startsWith("block-")) {
      const targetBlockId = overId.slice("block-".length)
      const target = findBlock(base, targetBlockId)
      if (!target) return
      const pointer = pointerFromEvent(e)
      if (!pointer) return
      const targetIsContainer = Boolean(REGISTRY_MAP.get(target.block.type)?.container)
      const zone = resolveDropZone(pointer, over.rect, viewport === "mobile", targetIsContainer)
      if (zone === "before-row" || zone === "after-row") {
        const position = zone === "before-row" ? "before" : "after"
        const targetRow = findRowDeep(base, target.rowId)
        // A block sharing its row with siblings can't fairly claim the whole
        // row's width for a new full-width row — scope it to just that column.
        next = (targetRow?.blocks.length ?? 1) > 1
          ? stackUnderBlock(base, movingBlock, targetBlockId, position)
          : insertRowRelativeToRow(base, mkRow(movingBlock), target.rowId, position)
      } else if (targetIsContainer) {
        next = insertIntoContainer(base, movingBlock, targetBlockId, zone === "before-in-row" ? "before" : "after")
      } else {
        next = insertIntoRowRelativeToBlock(base, movingBlock, targetBlockId, zone === "before-in-row" ? "before" : "after")
      }
    } else {
      return
    }

    setRows(next)
    if (isPalette) {
      setSelectedId(movingBlock.id)
      if (isNarrow) setShowInspectorMobile(true)
    }
  }

  function resizePair(rowId: string, leftId: string, rightId: string, leftW: number, rightW: number) {
    setRows((prev) =>
      updateRowDeep(prev, rowId, (r) => ({
        ...r,
        blocks: r.blocks.map((b) => (b.id === leftId ? { ...b, layout: { w: leftW } } : b.id === rightId ? { ...b, layout: { w: rightW } } : b)),
      })),
    )
  }

  function resizeHeight(blockId: string, px: number) {
    setRows((prev) =>
      updateBlockDeep(prev, blockId, (b) => {
        const decls = parseDecls(b.customCss ?? "").filter((d) => d.prop.trim().toLowerCase() !== "min-height")
        decls.push({ prop: "min-height", value: `${px}px` })
        return { ...b, customCss: declsToCss(decls) }
      }),
    )
  }

  function updateProp(key: string, value: unknown) {
    if (!selectedId) return
    setRows((prev) => updateBlockDeep(prev, selectedId, (b) => ({ ...b, props: { ...b.props, [key]: value } })))
  }

  function updateWidth(w: number) {
    if (!selectedId) return
    setRows((prev) => updateBlockDeep(prev, selectedId, (b) => ({ ...b, layout: { w } })))
  }

  function updateCustomCss(css: string) {
    if (!selectedId) return
    setRows((prev) => updateBlockDeep(prev, selectedId, (b) => ({ ...b, customCss: css })))
  }

  function duplicate(id: string) {
    const src = findBlock(rows, id)
    if (!src) return
    const copy: Block = { id: uid(), type: src.block.type, props: { ...src.block.props }, layout: { ...src.block.layout }, compositeId: src.block.compositeId, customCss: src.block.customCss, stackRows: src.block.stackRows ? cloneRowsWithFreshIds(src.block.stackRows) : undefined }
    setRows((prev) => duplicateInPlace(prev, id, copy))
    setSelectedId(copy.id)
  }

  function remove(id: string) {
    const next = removeBlock(rows, id)
    setRows(next)
    if (selectedId === id) setSelectedId(firstBlockId(next))
  }

  function toggleMultiSelect(id: string) {
    setMultiSelectIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSelectedId(id)
  }

  function cancelMultiSelect() {
    setMultiSelectIds(new Set())
  }

  // Reads rowsRef, not the closured `rows` state — reused directly by the dev
  // bridge (see saveSelectionAsComponent), which can call this right after a
  // synchronous bridge mutation, before React has re-rendered this closure.
  function saveAsComponentCore(blockIds: Set<string>, name: string): { compositeId: string; blockId: string } | null {
    if (blockIds.size === 0 || !name.trim()) return null
    const compositeRows = extractSelectedAsRows(rowsRef.current, blockIds)
    if (compositeRows.length === 0) return null
    const anchorRowId = findFirstSelectedRowId(rowsRef.current, blockIds)
    const newComponent: CustomComponent = { id: uid(), name: name.trim(), icon: "⬡", rows: compositeRows }

    let base = rowsRef.current
    for (const id of blockIds) base = removeBlock(base, id)
    const newBlock = mkCompositeInstance(newComponent.id)
    const next = anchorRowId ? insertRowRelativeToRow(base, mkRow(newBlock), anchorRowId, "before") : [...base, mkRow(newBlock)]

    setCustomComponents((prev) => [...prev, newComponent])
    setRows(next)
    return { compositeId: newComponent.id, blockId: newBlock.id }
  }

  function saveAsComponent() {
    if (multiSelectIds.size === 0) return
    const name = prompt("Name this component:", "MyComponent")
    if (!name || !name.trim()) return
    const result = saveAsComponentCore(multiSelectIds, name)
    if (!result) return
    setSelectedId(result.blockId)
    setMultiSelectIds(new Set())
  }

  function ungroup(id: string) {
    const src = findBlock(rows, id)
    if (!src || src.block.type !== COMPOSITE_TYPE) return
    const composite = customComponents.find((c) => c.id === src.block.compositeId)
    if (!composite) return
    const cloned = cloneRowsWithFreshIds(composite.rows)
    const idx = rows.findIndex((r) => r.id === src.rowId)
    if (idx === -1) return
    const row = rows[idx]!
    const remaining = row.blocks.filter((b) => b.id !== id)
    const next = remaining.length > 0
      ? [...rows.slice(0, idx), { ...row, blocks: remaining }, ...cloned, ...rows.slice(idx + 1)]
      : [...rows.slice(0, idx), ...cloned, ...rows.slice(idx + 1)]
    setRows(next)
    setSelectedId(cloned[0]?.blocks[0]?.id ?? null)
  }

  function clearRows() {
    setRows([])
    setSelectedId(null)
  }

  function clear() {
    if (!confirm("Clear the canvas? This can be undone with Undo.")) return
    clearRows()
  }

  function addFromPalette(type: string) {
    const def = REGISTRY_MAP.get(type)
    if (!def) return
    const newBlock = mkBlock(type, { ...def.defaults })
    setRows((prev) => [...prev, mkRow(newBlock)])
    setSelectedId(newBlock.id)
    if (isNarrow) setShowInspectorMobile(true)
  }

  function addCompositeFromPalette(compositeId: string) {
    const newBlock = mkCompositeInstance(compositeId)
    setRows((prev) => [...prev, mkRow(newBlock)])
    setSelectedId(newBlock.id)
    if (isNarrow) setShowInspectorMobile(true)
  }

  function applyPreset(kind: "dashboard" | "stats" | "settings" | "empty") {
    const next = presetRows(kind)
    setRows(next)
    setSelectedId(firstBlockId(next))
  }

  async function share() {
    const encoded = btoa(JSON.stringify(rows))
    const url = `${location.origin}${location.pathname}#b=${encoded}`
    await navigator.clipboard.writeText(url)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 1600)
  }

  const paletteDragDef = activeDrag?.kind === "palette" && activeDrag.type ? REGISTRY_MAP.get(activeDrag.type) : null
  const canUndo = undoStack.current.length > 0 || baselineRef.current !== rows
  const canRedo = redoStack.current.length > 0
  const blockCount = countBlocks(rows)

  // Dev-only bridge (window.__uiKitBuilder) so a model driving a live tab via
  // browser-automation tools can build/edit the page the same way drag-and-drop
  // does, and read back whatever a human then changes by hand. `undo`/`redo`
  // close over `rows` fresh every render, so the bridge's methods must read
  // through a ref updated synchronously here — not values captured once in an
  // effect — or a call made after the first render would act on stale state.
  const latestRef = useRef<LatestBuilderState>(null!)
  latestRef.current = {
    rowsRef, customComponentsRef, setRows, setCustomComponents,
    selectedId, multiSelectIds,
    undo, redo, undoStack, redoStack, baselineRef,
    saveAsComponentCore, clearRows,
  }
  const bridgeRef = useRef<UiKitBuilderBridge | null>(null)
  if (!bridgeRef.current) bridgeRef.current = createDevBridge(latestRef)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    // StrictMode runs this mount effect twice in dev — harmless: the guard
    // above makes bridge construction idempotent and re-assigning the same
    // object to window.__uiKitBuilder is a no-op.
    window.__uiKitBuilder = bridgeRef.current!
    return () => {
      delete window.__uiKitBuilder
    }
  }, [])

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div className="builder" style={{ "--code-h": `${codeHeight}px` } as React.CSSProperties}>
        <header className="builder-head">
          <div className="builder-head-left">
            <span className="builder-head-mark">UI</span>
            <div className="builder-head-titles">
              <span className="builder-head-title">Kit Builder <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "0.78rem" }}>· Estate</span></span>
              <span className="builder-head-sub">Drag · drop · copy real JSX</span>
            </div>
            <span className="builder-head-divider" />
            <a href="/library.html" style={{ fontSize: "0.76rem", color: "var(--muted)", textDecoration: "none", border: "1px solid var(--border)", borderRadius: 999, padding: "0.3rem 0.65rem", background: "var(--surface-2)", fontWeight: 600 }}>
              Library →
            </a>
          </div>

          <div className="builder-head-center">
            <div className="builder-viewport" role="tablist" aria-label="Preview width">
              <button type="button" role="tab" aria-selected={viewport === "desktop"} className={viewport === "desktop" ? "is-active" : ""} onClick={() => setViewport("desktop")}>◧ Desktop</button>
              <button type="button" role="tab" aria-selected={viewport === "mobile"} className={viewport === "mobile" ? "is-active" : ""} onClick={() => setViewport("mobile")}>▭ Mobile 390</button>
            </div>
          </div>

          <div className="builder-head-actions">
            <span className="builder-stat"><span className="builder-stat-dot" /> {blockCount} blocks</span>
            <Button size="sm" tone="quiet" onClick={undo} disabled={!canUndo} title="Undo (⌘Z)">↩ Undo</Button>
            <Button size="sm" tone="quiet" onClick={redo} disabled={!canRedo} title="Redo (⌘⇧Z)">↪ Redo</Button>
            <Button size="sm" tone={shareCopied ? "primary" : "quiet"} onClick={share}>{shareCopied ? "✓ Copied" : "Share URL"}</Button>
            {isNarrow && (
              <Button size="sm" onClick={() => setShowInspectorMobile((v) => !v)}>{selectedBlock ? `Edit · ${selectedBlock.type}` : "Inspector"}</Button>
            )}
            <ThemeToggle />
          </div>
        </header>

        <Palette search={search} onSearch={setSearch} onAdd={addFromPalette} customComponents={customComponents} onAddComposite={addCompositeFromPalette} />
        <Canvas
          rows={rows}
          selectedId={selectedId}
          multiSelectIds={multiSelectIds}
          customComponents={customComponents}
          dragActive={activeDrag !== null}
          dropHint={dropHint}
          onSelect={(id, additive) => {
            if (additive && id) {
              toggleMultiSelect(id)
              return
            }
            setMultiSelectIds(new Set())
            setSelectedId(id)
            if (id && isNarrow) setShowInspectorMobile(true)
          }}
          onDuplicate={duplicate}
          onDelete={remove}
          onClear={clear}
          onPreset={applyPreset}
          onResize={resizePair}
          onResizeHeight={resizeHeight}
          onSaveComponent={saveAsComponent}
          onCancelMultiSelect={cancelMultiSelect}
          viewport={viewport}
        />

        <div className="builder-inspector-desktop">
          <Inspector
            block={selectedBlock}
            def={selectedDef}
            onChange={updateProp}
            onWidthChange={updateWidth}
            onClose={() => setSelectedId(null)}
            onDuplicate={() => selectedBlock && duplicate(selectedBlock.id)}
            onDelete={() => selectedBlock && remove(selectedBlock.id)}
            onUngroup={selectedBlock?.type === COMPOSITE_TYPE ? () => ungroup(selectedBlock.id) : undefined}
          />
        </div>

        {showInspectorMobile && (
          <div className="builder-inspector-mobile" onClick={() => setShowInspectorMobile(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ height: "100%" }}>
              <Inspector
                block={selectedBlock}
                def={selectedDef}
                onChange={updateProp}
                onWidthChange={updateWidth}
                onClose={() => setShowInspectorMobile(false)}
                onDuplicate={() => {
                  if (selectedBlock) duplicate(selectedBlock.id)
                }}
                onDelete={() => {
                  if (selectedBlock) remove(selectedBlock.id)
                  setShowInspectorMobile(false)
                }}
                onUngroup={selectedBlock?.type === COMPOSITE_TYPE ? () => { ungroup(selectedBlock.id); setShowInspectorMobile(false) } : undefined}
              />
            </div>
          </div>
        )}

        <CodePanel rows={rows} customComponents={customComponents} selectedBlock={selectedBlock} onCustomCssChange={updateCustomCss} onResizeHeight={setCodeHeight} />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag?.kind === "palette" && activeDrag.compositeId ? (
          <div className="builder-palette-item" style={{ width: 260, boxShadow: "var(--shadow-md)", opacity: 0.96, transform: "rotate(1deg)" }}>
            <span className="builder-palette-icon">{customComponents.find((c) => c.id === activeDrag.compositeId)?.icon ?? "⬡"}</span>
            <span className="builder-palette-main">
              <span className="builder-palette-name">{customComponents.find((c) => c.id === activeDrag.compositeId)?.name ?? "Component"}</span>
              <span className="builder-palette-desc">Drop to add</span>
            </span>
          </div>
        ) : activeDrag?.kind === "palette" && paletteDragDef ? (
          <div className="builder-palette-item" style={{ width: 260, boxShadow: "var(--shadow-md)", opacity: 0.96, transform: "rotate(1deg)" }}>
            <span className="builder-palette-icon">{paletteDragDef.icon}</span>
            <span className="builder-palette-main">
              <span className="builder-palette-name">{paletteDragDef.label}</span>
              <span className="builder-palette-desc">Drop to add</span>
            </span>
          </div>
        ) : activeDrag?.kind === "block" && activeDrag.block ? (
          <div style={{ width: 420, opacity: 0.9, pointerEvents: "none", transform: "rotate(1deg)", boxShadow: "var(--shadow-md)", borderRadius: "var(--radius-lg)" }}>
            {(() => {
              const b = activeDrag.block!
              if (b.type === COMPOSITE_TYPE) {
                const composite = customComponents.find((c) => c.id === b.compositeId)
                return <div className="builder-palette-item"><span className="builder-palette-icon">{composite?.icon ?? "⬡"}</span><span className="builder-palette-main"><span className="builder-palette-name">{composite?.name ?? "Component"}</span></span></div>
              }
              const d = REGISTRY_MAP.get(b.type)
              return d ? d.render(b.props) : null
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
