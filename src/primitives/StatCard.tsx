import type { Severity } from "./Status"
import type { ReactNode } from "react"
import { cn } from "../cn"

/**
 * Map a 0–100 percentile to the stat-ramp tokens.
 *
 * Exported because an app that draws its own number beside a PercentileBar has
 * to agree with it about the same percentile, and the only way to do that
 * without this was to reimplement the five thresholds — which football did.
 */
export function rampColor(pct: number | null): string | null {
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
  /** What the bar is pacing against. Omitted, only the fraction shows.
      This used to be the hardcoded string "Season pace", which is a baseball
      idea and was appearing in an infrastructure dashboard underneath
      "3.3 GB free of 7.8 GB". The kit's own rule says no sport names outside
      src/sports/, and this was the one that got through. */
  label?: string
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
 * A single stat value with optional percentile pill + bar, progress bar,
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
            {progress.label ? <span>{progress.label}</span> : <span />}
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

/**
 * Compact horizontal stat display for tables and lists.
 *
 * `tone` exists because a row of counts is usually one interesting number and
 * several zeroes — "Workers 8 · Ready 0 · Running 0 · Failed 3" — and rendering
 * all four identically means the panel reporting three dead jobs looks like the
 * panel reporting none. The caller decides which number is news; nothing here
 * guesses, because "high is bad" is true of failures and false of workers.
 */
export function InlineStatRow({
  stats,
}: {
  stats: Array<{ label: string; value: ReactNode; tone?: Severity }>
}) {
  return (
    <div className="ui-inline-stats">
      {stats.map(({ label, value, tone }) => (
        <div key={label} className={cn("ui-inline-stat", tone && `ui-inline-stat--${tone}`)}>
          <span className="ui-inline-stat-label">{label}</span>
          <span className="ui-inline-stat-value">{value ?? "—"}</span>
        </div>
      ))}
    </div>
  )
}
