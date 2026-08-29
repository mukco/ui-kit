import { useEffect, useMemo, useRef, useState } from "react"
import { generateCode, generateJson } from "./codegen"
import { parseDecls, declsToCss, type CssDecl } from "./cssText"
import type { Block, CustomComponent, Row } from "./types"

// Properties seeded from the real rendered node's computed style, so the
// Styles panel opens already showing what the block looks like — not an
// empty "add a declaration" form. Dimmed/italic until edited, at which point
// they're promoted into a real, persisted customCss declaration.
const SEED_PROPS = ["background-color", "color", "padding", "margin", "border-radius", "box-shadow", "font-size", "font-weight", "opacity"]

const CSS_PROP_OPTIONS = [
  "background-color", "color", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "border", "border-radius", "border-color", "border-width",
  "box-shadow", "font-size", "font-weight", "font-family", "line-height", "letter-spacing",
  "width", "max-width", "min-width", "height", "max-height", "min-height",
  "display", "gap", "opacity", "text-align", "text-transform", "z-index",
]

function PanelResizeHandle({ onResize }: { onResize: (px: number) => void }) {
  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = (e.currentTarget.parentElement as HTMLElement | null)?.getBoundingClientRect().height ?? 240
    function onMove(ev: PointerEvent) {
      const dy = startY - ev.clientY
      onResize(Math.max(140, Math.min(640, Math.round(startHeight + dy))))
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }
  return (
    <div className="builder-code-resize-handle" onPointerDown={onPointerDown} role="separator" aria-orientation="horizontal" aria-label="Drag to resize the code panel" />
  )
}

// Real numbers step by 1 (×10 with Shift, ×0.1 with Alt); px/rem/% units are
// preserved. Non-numeric values (a color, "auto") pass through unchanged —
// arrow keys are a numeric-tweak affordance, not a generic cycle.
function stepNumericValue(value: string, dir: 1 | -1, big: boolean, small: boolean): string | null {
  const m = value.trim().match(/^(-?\d*\.?\d+)(px|rem|em|%|)$/)
  if (!m) return null
  const num = Number(m[1])
  const unit = m[2] ?? ""
  const step = big ? 10 : small ? 0.1 : 1
  const next = Math.round((num + dir * step) * 100) / 100
  return `${next}${unit}`
}

function DeclRow({
  decl,
  seeded,
  onChange,
  onRemove,
}: {
  decl: CssDecl
  seeded: boolean
  onChange: (next: CssDecl) => void
  onRemove: () => void
}) {
  const valueRef = useRef<HTMLInputElement>(null)

  function onValueKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return
    const stepped = stepNumericValue(decl.value, e.key === "ArrowUp" ? 1 : -1, e.shiftKey, e.altKey)
    if (stepped == null) return
    e.preventDefault()
    onChange({ ...decl, value: stepped })
  }

  return (
    <div className={`builder-decl-row ${seeded ? "is-seeded" : ""}`}>
      <input
        className="builder-decl-prop"
        list="builder-css-props"
        value={decl.prop}
        onChange={(e) => onChange({ ...decl, prop: e.target.value })}
        spellCheck={false}
      />
      <span className="builder-decl-colon">:</span>
      <input
        ref={valueRef}
        className="builder-decl-value"
        list={`builder-css-values-${decl.prop}`}
        value={decl.value}
        onChange={(e) => onChange({ ...decl, value: e.target.value })}
        onKeyDown={onValueKeyDown}
        spellCheck={false}
      />
      <span className="builder-decl-semi">;</span>
      <button type="button" className="builder-decl-remove" onClick={onRemove} aria-label={`Remove ${decl.prop}`} title="Remove">✕</button>
    </div>
  )
}

function NewDeclRow({ onAdd }: { onAdd: (decl: CssDecl) => void }) {
  const [prop, setProp] = useState("")
  const [value, setValue] = useState("")

  function commit() {
    if (!prop.trim() || !value.trim()) return
    onAdd({ prop: prop.trim(), value: value.trim() })
    setProp("")
    setValue("")
  }

  return (
    <div className="builder-decl-row builder-decl-row--new">
      <input
        className="builder-decl-prop"
        list="builder-css-props"
        placeholder="property"
        value={prop}
        onChange={(e) => setProp(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <span className="builder-decl-colon">:</span>
      <input
        className="builder-decl-value"
        placeholder="value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <span className="builder-decl-semi">;</span>
      <button type="button" className="builder-decl-add" onClick={commit} aria-label="Add declaration" title="Add">+</button>
    </div>
  )
}

// Reads the SELECTED block's own real rendered DOM node (not the outer
// `.builder-block` wrapper, which never carries visual styling itself) so the
// seeded rows reflect what's actually on screen.
function useComputedSeed(blockId: string | null): Record<string, string> {
  const [seed, setSeed] = useState<Record<string, string>>({})
  useEffect(() => {
    if (!blockId) {
      setSeed({})
      return
    }
    const el = document.querySelector(`[data-block-id="${blockId}"] .builder-block-content`)?.firstElementChild as HTMLElement | null
    if (!el) {
      setSeed({})
      return
    }
    const computed = getComputedStyle(el)
    const next: Record<string, string> = {}
    for (const prop of SEED_PROPS) next[prop] = computed.getPropertyValue(prop).trim()
    setSeed(next)
  }, [blockId])
  return seed
}

function StylesPanel({ block, onChange }: { block: Block; onChange: (css: string) => void }) {
  const declared = useMemo(() => parseDecls(block.customCss ?? ""), [block.customCss])
  const seed = useComputedSeed(block.id)

  const declaredProps = new Set(declared.map((d) => d.prop.trim().toLowerCase()))
  const seededRows: CssDecl[] = SEED_PROPS.filter((p) => !declaredProps.has(p) && seed[p]).map((p) => ({ prop: p, value: seed[p]! }))

  function commit(next: CssDecl[]) {
    onChange(declsToCss(next))
  }

  function updateAt(index: number, next: CssDecl) {
    const copy = [...declared]
    copy[index] = next
    commit(copy)
  }

  function removeAt(index: number) {
    commit(declared.filter((_, i) => i !== index))
  }

  function promoteSeeded(row: CssDecl) {
    commit([...declared, row])
  }

  function addNew(row: CssDecl) {
    commit([...declared.filter((d) => d.prop.trim().toLowerCase() !== row.prop.trim().toLowerCase()), row])
  }

  return (
    <div className="builder-styles-panel">
      <div className="builder-styles-head">{block.type}</div>
      <div className="builder-styles-body">
        {declared.map((d, i) => (
          <DeclRow key={i} decl={d} seeded={false} onChange={(next) => updateAt(i, next)} onRemove={() => removeAt(i)} />
        ))}
        {seededRows.map((d) => (
          <DeclRow key={d.prop} decl={d} seeded onChange={(next) => promoteSeeded(next)} onRemove={() => {}} />
        ))}
        <NewDeclRow onAdd={addNew} />
      </div>
      <p className="builder-styles-hint">Seeded values (dimmed) are what's actually rendering — edit one to make it a real, persisted override.</p>
      <datalist id="builder-css-props">
        {CSS_PROP_OPTIONS.map((p) => <option key={p} value={p} />)}
      </datalist>
    </div>
  )
}

export function CodePanel({
  rows,
  customComponents,
  selectedBlock,
  onCustomCssChange,
  onResizeHeight,
}: {
  rows: Row[]
  customComponents: CustomComponent[]
  selectedBlock: Block | null
  onCustomCssChange: (css: string) => void
  onResizeHeight: (px: number) => void
}) {
  const [tab, setTab] = useState<"jsx" | "json">("jsx")
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  const generated = useMemo(() => generateCode(rows, customComponents), [rows, customComponents])
  const json = useMemo(() => generateJson(rows), [rows])
  const lines = useMemo(() => generated.code.split("\n"), [generated.code])

  const glowRange = selectedBlock ? generated.blockLines[selectedBlock.id] : undefined

  useEffect(() => {
    if (!glowRange || !codeRef.current) return
    const first = codeRef.current.querySelector(".is-glow")
    first?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [glowRange])

  async function copy() {
    await navigator.clipboard.writeText(tab === "jsx" ? generated.code : json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  function download() {
    const text = tab === "jsx" ? generated.code : json
    const blob = new Blob([text], { type: "text/plain" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = tab === "jsx" ? "Demo.tsx" : "layout.json"
    a.click()
  }

  return (
    <div className="builder-code-panel">
      <PanelResizeHandle onResize={onResizeHeight} />
      <div className="builder-code-head">
        <span className="builder-code-title">
          <span aria-hidden>{"</>"}</span> Demo.tsx <span className="builder-code-count">{rows.reduce((n, r) => n + r.blocks.length, 0)} blocks · {lines.length} lines</span>
        </span>
        <div className="builder-code-tabs">
          <button type="button" className={tab === "jsx" ? "is-active" : ""} onClick={() => setTab("jsx")}>JSX</button>
          <button type="button" className={tab === "json" ? "is-active" : ""} onClick={() => setTab("json")}>JSON</button>
        </div>
        <div className="builder-code-actions">
          <button type="button" onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
          <button type="button" onClick={download} aria-label="Download" title="Download">⤓</button>
        </div>
      </div>
      <div className="builder-code-body">
        <div ref={codeRef} className="builder-code-lines">
          {tab === "jsx"
            ? lines.map((line, i) => {
                const n = i + 1
                const isGlow = glowRange ? n >= glowRange[0] && n <= glowRange[1] : false
                return (
                  <div key={i} className={`builder-code-line ${isGlow ? "is-glow" : ""}`}>
                    {line || " "}
                  </div>
                )
              })
            : json.split("\n").map((line, i) => (
                <div key={i} className="builder-code-line">{line || " "}</div>
              ))}
        </div>
        {tab === "jsx" && selectedBlock && (
          <StylesPanel block={selectedBlock} onChange={onCustomCssChange} />
        )}
      </div>
    </div>
  )
}
