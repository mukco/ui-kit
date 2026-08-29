import type { ReactNode } from "react"
import { cn } from "../cn"
import { HelpTip } from "./HelpTip"

export interface MetricCellDef {
  key: string
  label: string
  help?: string
  value: string | null
  colorClass?: string
  sub?: string | null
  pctile?: number | null
}

export interface MetricOpts {
  dense?: boolean
  ptsExact?: boolean
  ptsLabel?: string | null
  parLabel?: string | null
}

export function PercentileBarSmall({ pct }: { pct?: number | null }) {
  if (pct == null) return null
  const v = Math.max(0, Math.min(100, Number(pct)))
  const cls =
    v >= 75 ? "ui-metric-bar--hi" : v >= 50 ? "ui-metric-bar--mid" : v >= 25 ? "ui-metric-bar--warn" : "ui-metric-bar--low"
  return (
    <div className="ui-metric-bar">
      <div className={cn("ui-metric-bar-fill", cls)} style={{ width: `${v}%` }} />
    </div>
  )
}

/**
 * Shared metric-cells strip: value over label, columns separated by vertical rules.
 * Used by both baseball (pts/pPD+/surplus/PAR/market) and football (points/PAR/WOPR/EPA).
 * Fixed-width `align` mode keeps every requested key even when null (muted middot) so columns land at same x.
 * Salary badge (when `salary` present) sits in the middle as a visual divider, like baseball's bb-mc-sal.
 */
export function MetricCells({
  metrics,
  keys,
  defs,
  dense = false,
  compact = false,
  align = false,
  showBars = false,
  showHelp = false,
  hideSalary = false,
  trailing = null,
}: {
  metrics: Record<string, any>
  keys: string[]
  defs: Record<string, (m: Record<string, any>, o: MetricOpts) => MetricCellDef>
  dense?: boolean
  compact?: boolean
  align?: boolean
  showBars?: boolean
  showHelp?: boolean
  hideSalary?: boolean
  trailing?: ReactNode
}) {
  const opts: MetricOpts = {}
  const build = (k: string) => defs[k]?.(metrics, opts)
  const cells = keys
    .map(build)
    .filter(Boolean)
    .filter((c) => (align ? true : c!.value != null)) as MetricCellDef[]

  const sizeClass = compact ? "ui-metriccell--compact" : "ui-metriccell--normal"
  const salary = (metrics as any).salary

  if (dense) {
    const salaryCell = (
      <div key="salary" className="ui-metriccell ui-metriccell--dense">
        <div className="ui-metricval ui-metricval--dense">{salary ? `$${salary}` : "·"}</div>
      </div>
    )
    const keyCells = keys.map((k) => {
      const c = build(k)!
      if (!c) return null
      return (
        <div key={c.key} className="ui-metriccell ui-metriccell--dense" title={c.label}>
          <div className={cn("ui-metricval ui-metricval--dense", c.value == null ? "ui-metricval--muted" : c.colorClass)}>{c.value ?? "·"}</div>
        </div>
      )
    })
    const mid = Math.floor(keyCells.length / 2)
    return (
      <div className="ui-metriccells ui-metriccells--dense">
        {hideSalary ? keyCells : <>{keyCells.slice(0, mid)}{salaryCell}{keyCells.slice(mid)}</>}
      </div>
    )
  }

  const cellW = align ? (compact ? "ui-metriccell--fixed-sm" : "ui-metriccell--fixed") : compact ? "ui-metriccell--flex-sm" : "ui-metriccell--flex"
  const valCls = compact ? "ui-metricval ui-metricval--sm" : "ui-metricval"
  const salaryEl = hideSalary ? null : (
    <div className={cn("ui-metricsalary", align ? "ui-metricsalary--align" : "ui-metricsalary--row")}>
      {salary ? <span className="ui-salarybadge">${salary}</span> : null}
    </div>
  )

  const rowCells = align ? keys.map((k) => build(k)!).filter(Boolean) as MetricCellDef[] : cells

  return (
    <div className="ui-metriccells">
      {salaryEl}
      {rowCells.map((c) => (
        <div key={c.key} className={cn("ui-metriccell", cellW, sizeClass)}>
          <div className={cn(valCls, c.value == null ? "ui-metricval--muted" : c.colorClass)}>{c.value ?? "·"}</div>
          <div className="ui-metriclabel">
            {c.label}
            {showHelp && c.help && <HelpTip>{c.help}</HelpTip>}
          </div>
          {c.sub && !compact && <div className="ui-metricsub">{c.sub}</div>}
          {showBars && c.pctile != null && <PercentileBarSmall pct={c.pctile} />}
        </div>
      ))}
      {trailing}
    </div>
  )
}
