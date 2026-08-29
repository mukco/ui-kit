import { Fragment, useEffect, useRef, useState } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { COMPOSITE_TYPE, STACK_TYPE, type Block, type CustomComponent, type Row } from "./types"
import { REGISTRY_MAP } from "./registry"
import { parseCssText } from "./cssText"

type Resizable = {
  rowId: string
  leftId: string
  rightId: string
  leftW: number
  rightW: number
  leftEl: () => HTMLElement | null
  rightEl: () => HTMLElement | null
}

function ResizeDivider({ resizable, onResize }: { resizable: Resizable; onResize: (rowId: string, leftId: string, rightId: string, leftW: number, rightW: number) => void }) {
  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const { rowId, leftId, rightId } = resizable
    const leftEl = resizable.leftEl()
    const rightEl = resizable.rightEl()
    if (!leftEl || !rightEl) return
    const startX = e.clientX
    const leftPx0 = leftEl.getBoundingClientRect().width
    const rightPx0 = rightEl.getBoundingClientRect().width
    const combinedPx = leftPx0 + rightPx0
    const ratioTotal = resizable.leftW + resizable.rightW
    const minPx = 56

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const newLeftPx = Math.min(Math.max(leftPx0 + dx, minPx), Math.max(combinedPx - minPx, minPx))
      const leftRatio = Math.max(0.5, Math.round(((newLeftPx / combinedPx) * ratioTotal) * 10) / 10)
      const rightRatio = Math.max(0.5, Math.round((ratioTotal - leftRatio) * 10) / 10)
      onResize(rowId, leftId, rightId, leftRatio, rightRatio)
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <div
      className="builder-divider"
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Drag to resize columns"
    />
  )
}

function HeightHandle({ getEl, onResize }: { getEl: () => HTMLElement | null; onResize: (px: number) => void }) {
  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    const el = getEl()
    if (!el) return
    const startY = e.clientY
    const startHeight = el.getBoundingClientRect().height
    const minPx = 32

    function onMove(ev: PointerEvent) {
      const dy = ev.clientY - startY
      onResize(Math.max(minPx, Math.round(startHeight + dy)))
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <div
      className="builder-height-handle"
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Drag to resize height"
    />
  )
}

// A saved component's insides are a frozen preview — no drag handles, no
// per-block selection. Editing it means ungrouping back to real blocks,
// tweaking, and re-saving, the same "detach an instance" pattern design
// tools use for symbols/components. This is deliberately NOT the same
// mechanism as a stack (below) — a stack stays live and editable in place.
function CompositePreview({ rows, customComponents }: { rows: Row[]; customComponents: CustomComponent[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {rows.map((r) => (
        <div key={r.id} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
          {r.blocks.map((b) => {
            const cellStyle: React.CSSProperties = { flex: `${b.layout.w} ${b.layout.w} 0%`, minWidth: 0, ...(b.customCss ? parseCssText(b.customCss) : null) }
            if (b.type === COMPOSITE_TYPE) {
              const inner = customComponents.find((c) => c.id === b.compositeId)
              return <div key={b.id} style={cellStyle}>{inner ? <CompositePreview rows={inner.rows} customComponents={customComponents} /> : null}</div>
            }
            if (b.type === STACK_TYPE && b.stackRows) {
              return <div key={b.id} style={cellStyle}><CompositePreview rows={b.stackRows} customComponents={customComponents} /></div>
            }
            const def = REGISTRY_MAP.get(b.type)
            return <div key={b.id} style={cellStyle}>{def ? def.render(b.props) : null}</div>
          })}
        </div>
      ))}
    </div>
  )
}

type BlockCallbacks = {
  selectedId: string | null
  multiSelectIds: Set<string>
  customComponents: CustomComponent[]
  dropHint: { blockId: string; zone: string; label: string } | null
  hoveredId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string, additive: boolean) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onResize: (rowId: string, leftId: string, rightId: string, leftW: number, rightW: number) => void
  onResizeHeight: (blockId: string, px: number) => void
}

function DraggableBlock({ block, stacked, cb }: { block: Block; stacked: boolean; cb: BlockCallbacks }) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: block.id,
    data: { type: "block", blockId: block.id },
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `block-${block.id}`, data: { type: "block-target", blockId: block.id } })
  const isComposite = block.type === COMPOSITE_TYPE
  const isStack = block.type === STACK_TYPE
  const composite = isComposite ? cb.customComponents.find((c) => c.id === block.compositeId) : undefined
  const def = isComposite || isStack ? undefined : REGISTRY_MAP.get(block.type)
  const selected = cb.selectedId === block.id
  const multiSelected = cb.multiSelectIds.has(block.id)
  const w = block.layout.w
  const style: React.CSSProperties = {
    ...(stacked ? { flex: "1 1 auto" } : { flex: `${w} ${w} 0%` }),
    minWidth: 0,
    opacity: isDragging ? 0.4 : 1,
  }

  const contentRef = useRef<HTMLDivElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const appliedPropsRef = useRef<string[]>([])
  useEffect(() => {
    if (isStack) return // a stack's content is its own interactive rows, not a single styleable node
    const el = contentRef.current?.firstElementChild as HTMLElement | null | undefined
    if (!el) return
    const next = block.customCss ? parseCssText(block.customCss) : {}
    for (const prop of appliedPropsRef.current) {
      if (!(prop in next)) (el.style as unknown as Record<string, string>)[prop] = ""
    }
    for (const [prop, value] of Object.entries(next)) {
      (el.style as unknown as Record<string, string>)[prop] = value
    }
    appliedPropsRef.current = Object.keys(next)
  }, [block.customCss, isStack])

  const label = isComposite ? (composite?.name ?? "Component") : isStack ? "Stack" : block.type
  const icon = isComposite ? (composite?.icon ?? "⬡") : isStack ? "▤" : (def?.icon ?? "◈")
  const isHovered = cb.hoveredId === block.id
  // A selected block's own badge and a hovered descendant's badge are two
  // independently legitimate states, but nested tightly enough their floating
  // badges still land on nearly the same pixels — hover (what you're actively
  // pointing at right now) wins the shared badge slot; the stale selection
  // badge reappears once the pointer isn't resting on something more specific.
  const showChrome = isHovered || (selected && !cb.hoveredId)

  return (
    <div
      ref={(el) => {
        setDragRef(el)
        setDropRef(el)
        blockRef.current = el
      }}
      style={style}
      data-block-id={block.id}
      className={`builder-block ${isStack ? "builder-block--stack" : ""} ${isHovered ? "builder-block--hovered" : ""} ${selected ? "builder-block--selected" : ""} ${showChrome ? "builder-block--show-chrome" : ""} ${multiSelected ? "builder-block--multi-selected" : ""} ${isOver && !isDragging ? "builder-block--drop-target" : ""}`}
      onClick={(e) => {
        e.stopPropagation()
        cb.onSelect(block.id, e.metaKey || e.ctrlKey)
      }}
      // Plain CSS :hover bubbles to every ancestor, so a naive :hover rule
      // would light up a nested block's chip/handle AND its container's at
      // once — the exact "stack on top of each other, can't tell which is
      // selected" complaint. Tracking the hovered id in JS instead — the
      // innermost target's onMouseOver stops the event before it bubbles to
      // an ancestor's own handler — makes exactly one block "hovered" no
      // matter how deep the nesting.
      onMouseOver={(e) => {
        e.stopPropagation()
        cb.onHover(block.id)
      }}
      onMouseLeave={() => {
        if (cb.hoveredId === block.id) cb.onHover(null)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cb.onSelect(block.id, e.metaKey || e.ctrlKey) }
        if (e.key === "Delete" || e.key === "Backspace") cb.onDelete(block.id)
      }}
      aria-selected={selected}
    >
      <span className="builder-block-meta">
        <span aria-hidden>{icon}</span> {label}
      </span>

      <button
        type="button"
        className="builder-block-handle"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${label} to reorder`}
        title={stacked ? "Drag — drop above or below another block to reorder" : "Drag — drop on top/bottom of a block for a new row, left/right to share its row · ⌘/Ctrl-click to multi-select"}
      >
        ⠿
      </button>

      {selected && (
        <div className="builder-block-toolbar" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => cb.onDuplicate(block.id)} title="Duplicate" aria-label="Duplicate">⧉</button>
          <button type="button" onClick={() => cb.onDelete(block.id)} title="Remove" aria-label="Remove" className="danger">✕</button>
        </div>
      )}

      {isOver && !isDragging && (() => {
        const active = cb.dropHint?.blockId === block.id ? cb.dropHint.zone : null
        const zoneClass = (z: string) => `builder-zone${active === z ? " is-active" : ""}`
        const zoneLabel = (z: string) => (active === z ? cb.dropHint?.label : undefined)
        // Mirror resolveDropZone's own pixel-floored edge band (Builder.tsx)
        // so the highlighted area never lies about where the real threshold
        // is — a static 15% reads as a lie on a block short enough that the
        // real hit zone had to be floored up to a minimum pixel size.
        const heightPx = blockRef.current?.getBoundingClientRect().height ?? 0
        const edgePct = heightPx > 0 ? Math.min(40, Math.max(15, (14 / heightPx) * 100)) : 15
        const zonesStyle = { "--edge": `${edgePct}%` } as React.CSSProperties
        return (
          <div className="builder-block-zones" style={zonesStyle} aria-hidden>
            {stacked ? (
              <>
                <span className={`${zoneClass("before-row")} builder-zone--half-top`} data-label={zoneLabel("before-row")} />
                <span className={`${zoneClass("after-row")} builder-zone--half-bottom`} data-label={zoneLabel("after-row")} />
              </>
            ) : def?.container ? (
              <>
                <span className={`${zoneClass("before-row")} builder-zone--top`} data-label={zoneLabel("before-row")} />
                <span className={`${zoneClass("before-in-row")} builder-zone--mid-top`} data-label={zoneLabel("before-in-row")} />
                <span className={`${zoneClass("after-in-row")} builder-zone--mid-bottom`} data-label={zoneLabel("after-in-row")} />
                <span className={`${zoneClass("after-row")} builder-zone--bottom`} data-label={zoneLabel("after-row")} />
              </>
            ) : (
              <>
                <span className={`${zoneClass("before-row")} builder-zone--top`} data-label={zoneLabel("before-row")} />
                <span className={`${zoneClass("after-row")} builder-zone--bottom`} data-label={zoneLabel("after-row")} />
                <span className={`${zoneClass("before-in-row")} builder-zone--left`} data-label={zoneLabel("before-in-row")} />
                <span className={`${zoneClass("after-in-row")} builder-zone--right`} data-label={zoneLabel("after-in-row")} />
              </>
            )}
          </div>
        )
      })()}

      {isStack && block.stackRows ? (
        <div className="builder-row-list builder-row-list--nested">
          {block.stackRows.map((r) => (
            <RowView key={r.id} row={r} stacked={stacked} cb={cb} />
          ))}
        </div>
      ) : (
        <div ref={contentRef} className="builder-block-content" style={{ pointerEvents: isDragging ? "none" : undefined }}>
          {isComposite ? (
            composite ? <CompositePreview rows={composite.rows} customComponents={cb.customComponents} /> : <div style={{ padding: "1rem", color: "var(--danger)", fontSize: "0.85rem" }}>Missing component</div>
          ) : def?.container ? (
            block.stackRows && block.stackRows.length > 0 ? (
              def.render(block.props, (
                <div className="builder-row-list builder-row-list--nested">
                  {block.stackRows.map((r) => (
                    <RowView key={r.id} row={r} stacked={stacked} cb={cb} />
                  ))}
                </div>
              ))
            ) : (
              def.render(block.props)
            )
          ) : def ? (
            def.render(block.props)
          ) : (
            <div style={{ padding: "1rem", color: "var(--danger)", fontSize: "0.85rem" }}>Unknown: {block.type}</div>
          )}
        </div>
      )}

      <HeightHandle getEl={() => blockRef.current} onResize={(px) => cb.onResizeHeight(block.id, px)} />
    </div>
  )
}

function RowView({ row, stacked, cb }: { row: Row; stacked: boolean; cb: BlockCallbacks }) {
  const elMap = useRef(new Map<string, HTMLDivElement>())

  return (
    <div className={`builder-row ${stacked ? "is-mobile" : ""}`}>
      {row.blocks.map((b, i) => (
        <Fragment key={b.id}>
          {!stacked && i > 0 && (
            <ResizeDivider
              onResize={cb.onResize}
              resizable={{
                rowId: row.id,
                leftId: row.blocks[i - 1]!.id,
                rightId: b.id,
                leftW: row.blocks[i - 1]!.layout.w,
                rightW: b.layout.w,
                leftEl: () => elMap.current.get(row.blocks[i - 1]!.id) ?? null,
                rightEl: () => elMap.current.get(b.id) ?? null,
              }}
            />
          )}
          <div
            ref={(el) => {
              if (el) elMap.current.set(b.id, el)
              else elMap.current.delete(b.id)
            }}
            style={{ display: "contents" }}
          >
            <DraggableBlock block={b} stacked={stacked} cb={cb} />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function CanvasEndDrop({ dragActive, children }: { dragActive: boolean; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-end" })
  return (
    <div ref={setNodeRef} className={`builder-canvas-end ${dragActive ? "is-dragging" : ""} ${isOver ? "is-over" : ""}`}>
      {children}
    </div>
  )
}

export function Canvas({
  rows,
  selectedId,
  multiSelectIds,
  customComponents,
  dragActive,
  dropHint,
  onSelect,
  onDuplicate,
  onDelete,
  onClear,
  onPreset,
  onResize,
  onResizeHeight,
  onSaveComponent,
  onCancelMultiSelect,
  viewport,
}: {
  rows: Row[]
  selectedId: string | null
  multiSelectIds: Set<string>
  customComponents: CustomComponent[]
  dragActive: boolean
  dropHint: { blockId: string; zone: string; label: string } | null
  onSelect: (id: string | null, additive?: boolean) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onClear: () => void
  onPreset: (preset: "dashboard" | "settings" | "stats" | "empty") => void
  onResize: (rowId: string, leftId: string, rightId: string, leftW: number, rightW: number) => void
  onResizeHeight: (blockId: string, px: number) => void
  onSaveComponent: () => void
  onCancelMultiSelect: () => void
  viewport: "desktop" | "mobile"
}) {
  const stacked = viewport === "mobile"
  const blockCount = rows.reduce((n, r) => n + r.blocks.length, 0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const cb: BlockCallbacks = {
    selectedId,
    multiSelectIds,
    customComponents,
    dropHint,
    hoveredId,
    onHover: setHoveredId,
    onSelect: (id, additive) => onSelect(id, additive),
    onDuplicate,
    onDelete,
    onResize,
    onResizeHeight,
  }

  return (
    <main className="builder-canvas" onClick={() => onSelect(null)} aria-label="Canvas">
      <div className={`builder-canvas-inner ${stacked ? "is-mobile" : ""}`}>
        <div className="builder-canvas-bar">
          <span className="builder-canvas-label"><i /> Preview · {stacked ? "Mobile 390" : "Desktop"} · {blockCount} blocks</span>
          <div className="builder-canvas-actions">
            {multiSelectIds.size > 0 ? (
              <>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600 }}>{multiSelectIds.size} selected</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSaveComponent() }}
                  style={{ border: "1px solid var(--brand)", background: "var(--brand)", color: "var(--on-brand)", borderRadius: 999, padding: "0.28rem 0.75rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                >
                  ⬡ Save as component
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onCancelMultiSelect() }}
                  style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", borderRadius: 999, padding: "0.28rem 0.65rem", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              rows.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClear() }}
                  style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", borderRadius: 999, padding: "0.28rem 0.65rem", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Clear
                </button>
              )
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <CanvasEndDrop dragActive={dragActive}>
            <div className="builder-canvas-empty" onClick={(e) => e.stopPropagation()}>
              <div className="builder-canvas-empty-icon">⬡</div>
              <h3>Assemble a page from real kit parts</h3>
              <p>Drag from the palette or add a preset. Drop a block onto another: its top/bottom edge starts a new row (or, if it already shares a row, a stack scoped to just that column); left/right shares its row.</p>
              <div className="builder-presets">
                <button type="button" className="builder-preset builder-preset--primary" onClick={() => onPreset("dashboard")}>◈ Dashboard</button>
                <button type="button" className="builder-preset" onClick={() => onPreset("stats")}>▅ Stats grid</button>
                <button type="button" className="builder-preset" onClick={() => onPreset("settings")}>⚙ Settings page</button>
                <button type="button" className="builder-preset" onClick={() => onPreset("empty")}>∅ Empty state</button>
              </div>
            </div>
          </CanvasEndDrop>
        ) : (
          <>
            <div className="builder-row-list">
              {rows.map((r) => (
                <RowView key={r.id} row={r} stacked={stacked} cb={cb} />
              ))}
            </div>
            <CanvasEndDrop dragActive={dragActive} />
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {stacked ? (
                  <>Drag ⠿ to reorder — mobile stacks every row full-width, so columns and resize are desktop-only ·{" "}</>
                ) : (
                  <>Drag ⠿ · drop on a shared-row block's top/bottom to stack under it, left/right to share its row · drag <span style={{ border: "1px solid var(--border)", borderRadius: 4, padding: "0 4px", background: "var(--surface-2)", fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}>┃</span> to resize · ⌘-click to multi-select ·{" "}</>
                )}
                <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "0.1rem 0.3rem" }}>Del</kbd> to remove
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
