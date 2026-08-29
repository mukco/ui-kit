import { Toggle } from "../../src"
import type { Block, ComponentDef } from "./types"

const WIDTHS: Array<{ w: number; label: string }> = [
  { w: 3, label: "¼" },
  { w: 4, label: "⅓" },
  { w: 6, label: "½" },
  { w: 8, label: "⅔" },
  { w: 12, label: "Full" },
]

export function Inspector({
  block,
  def,
  onChange,
  onWidthChange,
  onClose,
  onDuplicate,
  onDelete,
  onUngroup,
}: {
  block: Block | null
  def: ComponentDef | null
  onChange: (key: string, value: unknown) => void
  onWidthChange: (w: number) => void
  onClose: () => void
  onDuplicate: () => void
  onDelete: () => void
  onUngroup?: () => void
}) {
  if (!block || !def) {
    return (
      <aside className="builder-inspector" aria-label="Inspector">
        <div className="builder-inspector-head">
          <div className="builder-inspector-head-main">
            <span className="builder-inspector-icon">◈</span>
            <div>
              <div className="builder-inspector-title">Inspector</div>
              <div className="builder-inspector-sub">No selection</div>
            </div>
          </div>
        </div>
        <div className="builder-inspector-empty">
          <div className="builder-inspector-empty-icon">⬔</div>
          <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Nothing selected</div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", maxWidth: 26 * 1 + "ch", lineHeight: 1.5 }}>
            Tap a block on the canvas to edit its props. Every field maps 1:1 to the JSX below — no phantom props.
          </div>
          <div className="builder-inspector-card">
            <strong style={{ color: "var(--text)" }}>Tokens only.</strong> Components read <code>var(--*)</code> from <code>ui.css</code>.<br />
            Override vars in a theme file after <code>ui.css</code> — never hardcode hex in props.
            <div style={{ marginTop: "0.5rem", fontSize: "0.72rem" }}>Palette → Canvas → Inspector → Copy</div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="builder-inspector" aria-label="Inspector">
      <div className="builder-inspector-head">
        <div className="builder-inspector-head-main">
          <span className="builder-inspector-icon" aria-hidden>{def.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div className="builder-inspector-title">{def.label}</div>
            <div className="builder-inspector-sub">{def.imports.length ? `${def.type} · ${def.imports.join(", ")}` : def.type}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          style={{ width: 30, height: 30, borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          ✕
        </button>
      </div>

      <div className="builder-inspector-body">
        <div className="builder-field">
          <span className="builder-field-label">Width</span>
          <div className="builder-width-row" role="radiogroup" aria-label="Width relative to row siblings">
            {WIDTHS.map((opt) => (
              <button
                key={opt.w}
                type="button"
                role="radio"
                aria-checked={block.layout.w === opt.w}
                className={`builder-width-btn ${block.layout.w === opt.w ? "is-active" : ""}`}
                onClick={() => onWidthChange(opt.w)}
                title={`Weight ${opt.w} relative to its row`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="builder-field-hint">Relative to the other blocks sharing its row — a solo block always fills it. Or drag the divider between blocks on the canvas.</span>
        </div>

        {def.propDefs.map((pd) => {
          const val = block.props[pd.key]

          if (pd.type === "boolean") {
            return (
              <div key={pd.key} className="builder-field">
                <div className="builder-field-row">
                  <span className="builder-field-label" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.82rem", color: "var(--text)" }}>{pd.label}</span>
                  <Toggle checked={Boolean(val)} onChange={(v) => onChange(pd.key, v)} label={pd.label} />
                </div>
                {pd.hint && <span className="builder-field-hint">{pd.hint}</span>}
              </div>
            )
          }

          if (pd.type === "select" && pd.options) {
            return (
              <label key={pd.key} className="builder-field">
                <span className="builder-field-label">{pd.label}</span>
                <select
                  value={String(val ?? "")}
                  onChange={(e) => onChange(pd.key, e.target.value)}
                >
                  {pd.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {pd.hint && <span className="builder-field-hint">{pd.hint}</span>}
              </label>
            )
          }

          if (pd.type === "number") {
            return (
              <label key={pd.key} className="builder-field">
                <span className="builder-field-label">{pd.label}</span>
                <input
                  type="number"
                  value={val === "" || val == null ? "" : String(val)}
                  min={pd.min}
                  max={pd.max}
                  placeholder={pd.placeholder}
                  onChange={(e) => onChange(pd.key, e.target.value === "" ? "" : Number(e.target.value))}
                />
                {pd.hint && <span className="builder-field-hint">{pd.hint}</span>}
              </label>
            )
          }

          if (pd.type === "textarea") {
            return (
              <label key={pd.key} className="builder-field">
                <span className="builder-field-label">{pd.label}</span>
                <textarea
                  value={String(val ?? "")}
                  placeholder={pd.placeholder}
                  onChange={(e) => onChange(pd.key, e.target.value)}
                  rows={pd.key === "facts" || pd.key === "bullets" ? 5 : 3}
                />
                {pd.hint && <span className="builder-field-hint">{pd.hint}</span>}
              </label>
            )
          }

          return (
            <label key={pd.key} className="builder-field">
              <span className="builder-field-label">{pd.label}</span>
              <input
                type="text"
                value={String(val ?? "")}
                placeholder={pd.placeholder}
                onChange={(e) => onChange(pd.key, e.target.value)}
              />
              {pd.hint && <span className="builder-field-hint">{pd.hint}</span>}
            </label>
          )
        })}

        <div className="builder-inspector-card" style={{ fontSize: "0.78rem" }}>
          Editing CSS? Find <code style={{ background: "var(--surface)", padding: "1px 4px", borderRadius: 4, border: "1px solid var(--border)" }}>{def.type}</code> glowing in the code panel below — its styles are editable right there, next to the JSX.
        </div>

        {onUngroup && (
          <div className="builder-inspector-card" style={{ fontSize: "0.78rem" }}>
            A saved component's insides are frozen — <button type="button" onClick={onUngroup} style={{ border: 0, background: "none", padding: 0, color: "var(--brand-text)", fontWeight: 600, cursor: "pointer", font: "inherit" }}>ungroup it</button> to edit the blocks inside, then re-save.
          </div>
        )}

        <div className="builder-inspector-actions">
          <button
            type="button"
            onClick={onDuplicate}
            style={{ flex: 1, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", borderRadius: 999, padding: "0.55rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            style={{ flex: 1, border: "1px solid color-mix(in srgb, var(--danger) 22%, transparent)", background: "color-mix(in srgb, var(--danger) 8%, transparent)", color: "var(--danger)", borderRadius: 999, padding: "0.55rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
          >
            Remove
          </button>
        </div>

        {!onUngroup && (
          <div className="builder-inspector-card" style={{ fontSize: "0.72rem", lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}><code style={{ background: "var(--surface)", padding: "1px 4px", borderRadius: 4, border: "1px solid var(--border)" }}>{def.type}</code> reads tokens</div>
            <code>--surface</code> · <code>--brand</code> · <code>--muted</code> · <code>--space-*</code> — override in a theme file after <code>ui.css</code>.
          </div>
        )}
      </div>
    </aside>
  )
}
