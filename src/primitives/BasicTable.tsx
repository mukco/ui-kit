import { useMemo, useState } from "react"
import { cn } from "../cn"
import { HelpTip } from "./HelpTip"

interface Props {
  /** Column names, shown as sortable headers. */
  columns: string[]
  /** Rows as arrays aligned with columns; cells may be primitives or null. */
  rows: unknown[][]
  /** Footer of per-column averages / min–max ranges / non-null counts. */
  showSummary?: boolean
  /** Max body height before scrolling (px). */
  maxHeight?: number
  /** Render a cell specially (identity links etc.); falls back to default formatting. */
  renderCell?: (value: unknown, col: string, rowIndex: number) => React.ReactNode
  className?: string
}

function fmtNum(v: number): string {
  if (!Number.isFinite(v)) return String(v)
  if (Number.isInteger(v)) return v.toLocaleString()
  const abs = Math.abs(v)
  if (abs >= 100) return v.toFixed(1)
  if (abs >= 10) return v.toFixed(2)
  if (abs >= 0.001) return v.toFixed(3)
  return v.toPrecision(4)
}

function fmtSummary(v: number): string {
  if (!Number.isFinite(v)) return String(v)
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + "k"
  if (Math.abs(v) >= 10) return v.toFixed(1)
  return v.toFixed(3).replace(/\.?0+$/, "")
}

/** The basic data grid: plain columns+rows, sortable headers, sticky head,
    optional stats footer. The simpler sibling of DataTable — no heat pills,
    no object rows; exactly what raw query results want. */
export function BasicTable({ columns, rows, showSummary = false, maxHeight = 480, renderCell, className }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const sortedRows = useMemo(() => {
    if (!rows.length || !sortKey) return rows
    const idx = columns.indexOf(sortKey)
    if (idx < 0) return rows
    return [...rows].sort((a, b) => {
      const av = a[idx], bv = b[idx]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const an = Number(av), bn = Number(bv)
      const cmp = Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [rows, columns, sortKey, sortDir])

  function handleSort(col: string) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(col)
      setSortDir("desc")
    }
  }

  const summary = useMemo(() => {
    if (!showSummary) return null
    return columns.map((_, colIdx) => {
      const vals = rows.map((r) => r[colIdx]).filter((v) => v != null && Number.isFinite(Number(v))).map(Number)
      if (!vals.length) return { type: "text" as const, count: rows.filter((r) => r[colIdx] != null).length }
      const sum = vals.reduce((a, b) => a + b, 0)
      return { type: "numeric" as const, avg: sum / vals.length, min: Math.min(...vals), max: Math.max(...vals) }
    })
  }, [columns, rows, showSummary])

  return (
    <div className={cn("ui-btable-wrap", className)} style={{ maxHeight }}>
      <table className="ui-btable">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} onClick={() => handleSort(c)}>
                <span className="ui-th-inner">
                  {c}
                  <HelpTip>{`Sort by ${c}`}</HelpTip>
                  {sortKey === c && <span className="ui-sort-arrow">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, i) => (
                <td key={`${ri}-${i}`}>
                  {cell == null ? (
                    <span className="ui-btable-null">—</span>
                  ) : (
                    renderCell?.(cell, columns[i], ri) ?? (
                      <span className="ui-mono">{typeof cell === "number" ? fmtNum(cell) : String(cell)}</span>
                    )
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {summary && (
          <tfoot>
            <tr>
              {summary.map((s, i) => (
                <td key={i}>
                  {s.type === "numeric" ? (
                    <span className="ui-btable-sumstat">
                      <span>avg {fmtSummary(s.avg)}</span>
                      <span>
                        {fmtSummary(s.min)} – {fmtSummary(s.max)}
                      </span>
                    </span>
                  ) : (
                    <span className="ui-btable-count">{s.count} non-null</span>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
