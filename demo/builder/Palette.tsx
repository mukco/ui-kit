import { useDraggable } from "@dnd-kit/core"
import { REGISTRY, CATEGORIES } from "./registry"
import type { CustomComponent } from "./types"

const DESCRIPTIONS: Record<string, string> = {
  Button: "Action or link",
  Card: "Surface + title",
  "Stat Card": "Value + percentile",
  "Page Header": "Title + actions",
  Tabs: "Section switch",
  "Empty State": "Friendly void",
  Loading: "Waiting state",
  Avatar: "Photo / initials",
  "Matchup Card": "Teams + score",
  "Award Card": "Icon + winner",
  "List Row": "One list item",
  "Fact Grid": "Label / value",
  "Data Table": "Sortable rows",
  Chart: "Bar / line / scatter",
  "Expandable Card": "Folds open",
  "Insights Card": "AI bullets",
  "Toggle + Setting Row": "Switch row",
  Chips: "Status badges",
  "Basic Table": "Dense table",
  "Percentile Gauge": "Gauge rows",
}

function PaletteItem({
  type,
  label,
  icon,
  category,
  onAdd,
}: {
  type: string
  label: string
  icon: string
  category: string
  onAdd: (type: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type: "palette", componentType: type },
  })
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        type="button"
        className="builder-palette-item"
        style={{ opacity: isDragging ? 0.55 : 1, flex: 1 }}
        title={`Drag ${label} to canvas — or tap + to add`}
      >
        <span className="builder-palette-icon" aria-hidden>{icon}</span>
        <span className="builder-palette-main">
          <span className="builder-palette-name">{label}</span>
          <span className="builder-palette-desc">{DESCRIPTIONS[label] ?? category}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onAdd(type)}
        aria-label={`Add ${label} to canvas`}
        title={`Add ${label}`}
        className="builder-palette-add"
      >
        +
      </button>
    </div>
  )
}

function CompositePaletteItem({ component, onAdd }: { component: CustomComponent; onAdd: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-component-${component.id}`,
    data: { type: "palette", compositeId: component.id },
  })
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        type="button"
        className="builder-palette-item"
        style={{ opacity: isDragging ? 0.55 : 1, flex: 1 }}
        title={`Drag ${component.name} to canvas — or tap + to add`}
      >
        <span className="builder-palette-icon" aria-hidden>{component.icon}</span>
        <span className="builder-palette-main">
          <span className="builder-palette-name">{component.name}</span>
          <span className="builder-palette-desc">Your component</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onAdd(component.id)}
        aria-label={`Add ${component.name} to canvas`}
        title={`Add ${component.name}`}
        className="builder-palette-add"
      >
        +
      </button>
    </div>
  )
}

export function Palette({
  search,
  onSearch,
  onAdd,
  customComponents,
  onAddComposite,
}: {
  search: string
  onSearch: (v: string) => void
  onAdd: (type: string) => void
  customComponents: CustomComponent[]
  onAddComposite: (id: string) => void
}) {
  const q = search.toLowerCase().trim()
  const filtered = q
    ? REGISTRY.filter((r) => r.label.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
    : REGISTRY

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: filtered.filter((r) => r.category === cat),
  })).filter((g) => g.items.length > 0)

  const total = filtered.length
  const filteredComponents = q ? customComponents.filter((c) => c.name.toLowerCase().includes(q)) : customComponents

  return (
    <aside className="builder-palette" aria-label="Component palette">
      <div className="builder-palette-head">
        <div className="builder-palette-title">
          <h2>Palette</h2>
          <span className="builder-palette-count">{total} · {CATEGORIES.length} groups</span>
        </div>
        <div className="builder-search-wrap">
          <span className="builder-search-icon" aria-hidden>⌕</span>
          <input
            className="builder-search"
            placeholder="Search components… (e.g. card, table)"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search components"
          />
          {search && (
            <button type="button" className="builder-search-clear" onClick={() => onSearch("")} aria-label="Clear search">✕</button>
          )}
        </div>
      </div>
      <div className="builder-palette-scroll">
        {filteredComponents.length > 0 && (
          <div className="builder-cat">
            <div className="builder-cat-head">
              <span className="builder-cat-label">Your components</span>
              <span className="builder-cat-count">{filteredComponents.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredComponents.map((c) => (
                <CompositePaletteItem key={c.id} component={c} onAdd={onAddComposite} />
              ))}
            </div>
          </div>
        )}
        {grouped.map((g) => (
          <div key={g.cat} className="builder-cat">
            <div className="builder-cat-head">
              <span className="builder-cat-label">{g.cat}</span>
              <span className="builder-cat-count">{g.items.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {g.items.map((r) => (
                <PaletteItem key={r.type} type={r.type} label={r.label} icon={r.icon} category={r.category} onAdd={onAdd} />
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && filteredComponents.length === 0 && (
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", padding: "1rem", textAlign: "center" }}>
            No matches for “{search}”
            <div style={{ marginTop: "0.5rem" }}>
              <button type="button" onClick={() => onSearch("")} style={{ border: "1px solid var(--border)", background: "var(--surface-2)", borderRadius: 999, padding: "0.3rem 0.7rem", fontSize: "0.75rem", cursor: "pointer" }}>
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="builder-palette-foot">
        <span style={{ fontSize: "0.68rem" }}>Drag to canvas · <kbd>+</kbd> to append</span>
        <span style={{ marginLeft: "auto", fontSize: "0.68rem", opacity: 0.8 }}>{total} components</span>
      </div>
    </aside>
  )
}
