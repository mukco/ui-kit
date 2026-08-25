import { useMemo, useState } from "react"
import PivotTableUI from "react-pivottable/PivotTableUI"
import TableRenderers from "react-pivottable/TableRenderers"
import { aggregatorTemplates } from "react-pivottable/Utilities"
import "react-pivottable/pivottable.css"

// Identifiers/dimensions — never meaningful to sum or average. Apps can
// extend the set via `dimensionColumns`.
const DEFAULT_DIMENSIONS = [
  "player_id", "fg_id", "mlbam_id", "name", "team", "league",
  "position", "season", "year", "projection_system", "id",
]

function toNum(v: unknown): number {
  if (v == null || v === "") return NaN
  return typeof v === "number" ? v : Number(v)
}

function fmt(v: unknown): string {
  const n = toNum(v)
  if (!Number.isFinite(n)) return v == null ? "" : String(v)
  if (Number.isInteger(n)) return n.toLocaleString()
  const abs = Math.abs(n)
  if (abs >= 100) return n.toFixed(1)
  if (abs >= 10) return n.toFixed(2)
  if (abs >= 0.001) return n.toFixed(3)
  return n.toPrecision(4)
}

const fmtInt = (v: unknown) => {
  const n = toNum(v)
  return Number.isFinite(n) ? Math.round(n).toLocaleString() : String(v ?? "")
}

const tpl = aggregatorTemplates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AGGREGATORS: any = {
  Average: tpl.average(fmt),
  Sum: tpl.sum(fmt),
  Count: tpl.count(fmtInt),
  Max: tpl.max(fmt),
  Min: tpl.min(fmt),
  Median: tpl.median(fmt),
  "Std Dev": tpl.stdev(1, fmt),
  "% of Total": tpl.fractionOf(tpl.sum(), "total", (v: unknown) => fmt(toNum(v) * 100) + "%"),
}

function toObjects(columns: string[], rows: unknown[][], dims: Set<string>): Record<string, unknown>[] {
  return rows.map((row) =>
    Object.fromEntries(
      columns.map((col, i) => {
        const v = row[i]
        if (v == null || v === "") return [col, null]
        if (dims.has(col)) return [col, String(v)]
        const n = Number(v)
        return [col, Number.isFinite(n) ? n : String(v)]
      }),
    ),
  )
}

interface Props {
  columns: string[]
  rows: unknown[][]
  /** Extra column names to treat as dimensions (drag targets, not sums). */
  dimensionColumns?: string[]
}

const TIPS = [
  { label: "Group by one", hint: "Rows: name · Value: a metric" },
  { label: "Matrix", hint: "Rows: name · Cols: season · Value: a metric" },
]

// Only the table renderer — charts have their own tab.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RENDERERS: any = { Table: TableRenderers.Table }

/** Drag-and-drop pivot over raw rows; the analysis step above a BasicTable.
    Dimensions vs metrics are auto-detected and extendable per app. */
export function SandboxPivot({ columns, rows, dimensionColumns }: Props) {
  const dims = useMemo(() => new Set([...DEFAULT_DIMENSIONS, ...(dimensionColumns ?? [])]), [dimensionColumns])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = useMemo(() => toObjects(columns, rows, dims), [columns, rows, dims]) as any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pivotState, setPivotState] = useState<any>(() => {
    const dimCols = columns.filter((c) => dims.has(c))
    const metrics = columns.filter((c) => !dims.has(c))
    return {
      rows: dimCols.length ? [dimCols[0]] : [],
      cols: [],
      vals: metrics.length ? [metrics[0]] : [],
      aggregatorName: metrics.length ? "Average" : "Count",
      rendererName: "Table",
    }
  })

  return (
    <div className="ui-sb-pivot">
      <div className="ui-sb-tips">
        <span className="ui-sb-tipslabel">Quick starts</span>
        {TIPS.map((t) => (
          <span key={t.label} className="ui-sb-tip">
            <strong>{t.label}:</strong> {t.hint}
          </span>
        ))}
        <span className="ui-sb-note ui-sb-tipsright">Drag pills into Rows / Cols zones · pick aggregation</span>
      </div>

      <div className="ui-sb-pivotbody">
        <PivotTableUI data={data} aggregators={AGGREGATORS} renderers={RENDERERS} onChange={setPivotState} {...pivotState} />
      </div>
    </div>
  )
}
