import { useMemo, useState, type ReactNode } from "react"
import { cn } from "../cn"
import { EmptyState } from "./EmptyState"
import { ErrorState } from "./ErrorState"

export interface TableColumn<T> {
  key: string
  // ReactNode, not string: a caller composing a stat-help tooltip next to
  // the label (e.g. GlossaryTip) needs to render more than text here. A
  // plain string is already a valid ReactNode, so no existing column changes.
  label: ReactNode
  /** Format the raw value for display. */
  fmt?: (value: unknown) => ReactNode
  align?: "left" | "right"
  /** Column participates in the heat ramp; flip for lower-is-better stats. */
  lowIsBetter?: boolean
  /** Escape hatch: fully custom cell content (identity links, badges…). */
  render?: (row: T) => ReactNode
}

interface Props<T extends Record<string, unknown>> {
  data: T[] | null
  columns: TableColumn<T>[]
  /** Stable row identity; defaults to array index. */
  rowKey?: (row: T, index: number) => string
  /** When provided, rows become click-to-expand with this detail line. */
  renderExpanded?: (row: T) => ReactNode
  empty?: ReactNode
  /** When set, the table renders a failure instead of an empty state. `data`
      being null means "nothing yet"; this means "the attempt failed", and the
      two were previously indistinguishable to the reader. */
  error?: ReactNode
  /** Offered alongside `error`. */
  onRetry?: () => void
  /** Caps the table at this height with an internal scroll region and a
      sticky header — for tables that can run to hundreds of rows. Omit for
      a table that should grow with the page (the default). */
  maxHeight?: string
  className?: string
}

function ramp(pct: number): string {
  if (pct >= 0.85) return "var(--stat-elite)"
  if (pct >= 0.65) return "var(--stat-great)"
  if (pct >= 0.4) return "var(--stat-avg)"
  if (pct >= 0.2) return "var(--stat-below)"
  return "var(--stat-poor)"
}

/** Value pill colored against its column distribution. */
export function HeatPill({ children, color }: { children: ReactNode; color?: string | null }) {
  if (!color) return <span className="ui-mono ui-td">{children}</span>
  return (
    <span className="ui-heatpill" style={{ color, background: `color-mix(in oklch, ${color} 12%, transparent)` }}>
      {children}
    </span>
  )
}

/**
 * Column-driven sortable table with distribution heat pills and optional
 * click-to-expand rows. Sorting lives inside the component. Wide tables
 * scroll horizontally on phones.
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  renderExpanded,
  empty = "No data available.",
  error,
  onRetry,
  maxHeight,
  className,
}: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null)
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const rows = useMemo(() => {
    if (!data?.length) return []
    if (!sort) return data
    const dir = sort.dir === "asc" ? 1 : -1
    return [...data].sort((a, b) => {
      const av = Number(a[sort.key])
      const bv = Number(b[sort.key])
      if (Number.isFinite(av) && Number.isFinite(bv)) return (av - bv) * dir
      return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * dir
    })
  }, [data, sort])

  // Per-column min/max for heat coloring.
  const ranges = useMemo(() => {
    const map: Record<string, { min: number; max: number }> = {}
    if (!data?.length) return map
    for (const col of columns) {
      if (col.lowIsBetter === undefined) continue // no heat flag → plain column
      const nums = data.map((r) => Number(r[col.key])).filter(Number.isFinite)
      if (!nums.length) continue
      map[col.key] = { min: Math.min(...nums), max: Math.max(...nums) }
    }
    return map
  }, [data, columns])

  function toggleSort(key: string) {
    setSort((s) =>
      s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" },
    )
  }

  // Checked before the empty case: a failed fetch also leaves `data` empty, and
  // rendering "no rows" over a request that never succeeded tells the reader
  // the opposite of what happened.
  if (error != null) {
    return (
      <div className={cn("ui-card", className)}>
        <ErrorState onRetry={onRetry}>{error}</ErrorState>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className={cn("ui-card", className)}>
        <EmptyState icon="📊">{empty}</EmptyState>
      </div>
    )
  }

  function heatColor(col: TableColumn<T>, raw: unknown): string | null {
    const range = ranges[col.key]
    const n = Number(raw)
    if (!range || !Number.isFinite(n)) return null
    let pct = range.max === range.min ? 1 : (n - range.min) / (range.max - range.min)
    if (col.lowIsBetter) pct = 1 - pct
    return ramp(pct)
  }

  return (
    <div className={cn("ui-tablecard", className)}>
      <div className="ui-tablescroll" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
        <table className={cn("ui-table", maxHeight && "ui-table--sticky")}>
          <thead>
            <tr>
              <th className="ui-th ui-th-num">#</th>
              {columns.map((col) => {
                const sorted = sort?.key === col.key
                return (
                  <th
                    key={col.key}
                    className={cn("ui-th", col.align === "right" && "ui-th--right")}
                    // Announced, so a screen reader says "sorted ascending"
                    // rather than leaving the order a mystery. "none" on the
                    // rest is what tells it the column *can* be sorted.
                    aria-sort={sorted ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    {/* A real button, not onClick on the <th>. The cell version
                        was reachable by mouse only — no tabIndex, no key
                        handler — so sorting a table was impossible from a
                        keyboard and silent to assistive tech, while looking
                        interactive to everyone else. */}
                    <button
                      type="button"
                      className="ui-th-sort"
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="ui-th-inner">
                        {col.label}
                        {sorted && (
                          <span className="ui-sort-arrow" aria-hidden="true">
                            {sort.dir === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const k = rowKey ? rowKey(row, i) : String(i)
              const expandable = !!renderExpanded
              const isOpen = expandable && expandedKey === k
              return (
                <ExpandableRowBody
                  key={k}
                  index={i}
                  row={row}
                  columns={columns}
                  heatColor={heatColor}
                  expandable={expandable}
                  open={isOpen}
                  onToggle={() => setExpandedKey((cur) => (cur === k ? null : k))}
                  renderExpanded={renderExpanded!}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExpandableRowBody<T extends Record<string, unknown>>({
  index,
  row,
  columns,
  heatColor,
  expandable,
  open,
  onToggle,
  renderExpanded,
}: {
  index: number
  row: T
  columns: TableColumn<T>[]
  heatColor: (col: TableColumn<T>, raw: unknown) => string | null
  expandable: boolean
  open: boolean
  onToggle: () => void
  renderExpanded: (row: T) => ReactNode
}) {
  const cells = columns.map((col) => {
    const raw = row[col.key]
    if (col.render) {
      return (
        <td key={col.key} className={cn("ui-td", col.align === "right" && "ui-td--right")}>
          {col.render(row)}
        </td>
      )
    }
    const shown = raw != null ? (col.fmt ? col.fmt(raw) : String(raw)) : "—"
    const color = heatColor(col, raw)
    if (color) {
      return (
        <td key={col.key} className={cn("ui-td", col.align === "right" && "ui-td--right")}>
          <HeatPill color={color}>{shown}</HeatPill>
        </td>
      )
    }
    return (
      <td key={col.key} className={cn("ui-td", col.align === "right" && "ui-td--right")}>
        {shown}
      </td>
    )
  })

  return (
    <>
      <tr
        className={cn("ui-tr", expandable && "ui-tr--clickable", open && "ui-tr--open")}
        onClick={expandable ? onToggle : undefined}
      >
        <td className="ui-td ui-td-num">{index + 1}</td>
        {cells}
      </tr>
      {open && (
        <tr className="ui-tr-expanded">
          <td colSpan={columns.length + 1}>{renderExpanded(row)}</td>
        </tr>
      )}
    </>
  )
}
