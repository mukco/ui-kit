import type { ReactNode } from "react"
import { cn } from "../cn"

/** Map a 0–100 percentile to the stat-ramp tokens. */
function rampColor(pct: number | null): string | null {
  if (pct == null) return null
  if (pct >= 85) return "var(--stat-elite)"
  if (pct >= 65) return "var(--stat-great)"
  if (pct >= 40) return "var(--stat-avg)"
  if (pct >= 20) return "var(--stat-below)"
  return "var(--stat-poor)"
}

export function PercentileBar({ percentile, className }: { percentile: number | null; className?: string }) {
  if (percentile == null) return null
  const color = rampColor(percentile)
  return (
    <div className={cn("ui-bar", className)}>
      <div className="ui-bar-fill" style={{ width: `${Math.max(2, percentile)}%`, background: color ?? undefined }} />
    </div>
  )
}

export interface StatComparison {
  projectedLabel: string
  status: string
  /** Any CSS color; apps typically pass var(--ok) / var(--danger). */
  color: string
}

export interface StatProgress {
  current: number
  target: number
}

interface Props {
  label: string
  value: ReactNode
  subtitle?: string
  percentile?: number | null
  progress?: StatProgress
  comparison?: StatComparison
  /** Render the pill/bar in flat muted ink instead of the good/bad ramp — for
      descriptive stats that are not better-when-higher. */
  neutral?: boolean
  /** Flip the ramp (lower percentile is better). */
  invert?: boolean
  className?: string
}

/**
 * A single stat value with optional percentile pill + bar, season-pace bar,
 * or projection comparison strip.
 */
export function StatCard({ label, value, subtitle, percentile, progress, comparison, neutral = false, invert = false, className }: Props) {
  const displayValue = value ?? "—"
  const displayPct = invert && percentile != null ? 100 - percentile : (percentile ?? null)
  const pctColor = neutral ? "var(--muted)" : rampColor(displayPct)
  const showPercentile = displayPct != null && pctColor != null
  const progressPct =
    progress && Number(progress.target) > 0
      ? Math.max(0, Math.min(100, (Number(progress.current) / Number(progress.target)) * 100))
      : null

  return (
    <div className={cn("ui-card ui-stat", className)}>
      <div className="ui-stat-head">
        <span className="ui-stat-label">{label}</span>
        {showPercentile && (
          <span
            className="ui-stat-pill"
            style={{ color: pctColor as string, background: `color-mix(in oklch, ${pctColor} 14%, transparent)` }}
            title="Percentile among qualified peers"
          >
            {displayPct}%
          </span>
        )}
      </div>

      <div className="ui-stat-value-row">
        <span className="ui-stat-value">{displayValue}</span>
        {subtitle && <span className="ui-stat-sub">{subtitle}</span>}
      </div>

      {showPercentile && <PercentileBar percentile={displayPct} />}

      {progressPct != null && progress && (
        <div className="ui-stat-foot">
          <div className="ui-stat-foot-row">
            <span>Season pace</span>
            <span className="ui-mono">
              {progress.current} / {progress.target}
            </span>
          </div>
          <div className="ui-bar">
            <div className="ui-bar-fill" style={{ width: `${progressPct}%`, background: "color-mix(in srgb, var(--brand) 60%, transparent)" }} />
          </div>
        </div>
      )}

      {comparison && (
        <div className="ui-stat-foot" style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span style={{ color: "var(--muted)" }}>{comparison.projectedLabel}</span>
          <span style={{ fontWeight: 600, color: comparison.color }}>{comparison.status}</span>
        </div>
      )}
    </div>
  )
}

/** Compact horizontal stat display for tables/lists. */
export function InlineStatRow({ stats }: { stats: Array<{ label: string; value: ReactNode }> }) {
  return (
    <div className="ui-inline-stats">
      {stats.map(({ label, value }) => (
        <div key={label} className="ui-inline-stat">
          <span className="ui-inline-stat-label">{label}</span>
          <span className="ui-inline-stat-value">{value ?? "—"}</span>
        </div>
      ))}
    </div>
  )
}
