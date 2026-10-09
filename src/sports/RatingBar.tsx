import { cn } from "../cn"

/**
 * One scouting rating on the 20–80 scale — OOTP's bar: the rating filled in,
 * and the scouts' range for where he is headed as a lighter band beyond it.
 * "55 · 60–70" at the right says the same in numbers. A veteran's range
 * collapses onto his rating; a 20-year-old's is wide.
 *
 * Heat-mapped on the apps' stat ramp (--stat-poor … --stat-elite) by the
 * scale's own bands (20–35 poor, 40–45 below, 50 average, 55–60 above,
 * 65+ plus/elite): the bar, the rating and each end of the range, so a page
 * of them reads at a glance, in every theme.
 */
export interface RatingBarProps {
  label: string
  current: number
  potentialLow?: number | null
  potentialHigh?: number | null
  className?: string
}

const MIN = 20
const MAX = 80
const pct = (v: number) => `${((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * 100}%`

export function ratingTier(v: number): "poor" | "below" | "average" | "above" | "plus" | "elite" {
  if (v >= 75) return "elite"
  if (v >= 65) return "plus"
  if (v >= 55) return "above"
  if (v >= 50) return "average"
  if (v >= 40) return "below"
  return "poor"
}

const HEAT = { poor: "--stat-poor", below: "--stat-below", average: "--stat-avg", above: "--stat-great", plus: "--stat-elite", elite: "--stat-elite" } as const

/** The heat colour of a 20–80 rating. */
export const ratingHeat = (v: number) => `var(${HEAT[ratingTier(v)]})`

export function RatingBar({ label, current, potentialLow, potentialHigh, className }: RatingBarProps) {
  const low = potentialLow ?? current
  const high = potentialHigh ?? current
  const growing = high > current
  return (
    <div className={cn("ui-ratingbar", `ui-ratingbar--${ratingTier(current)}`, className)}>
      <span className="ui-ratingbar-label">{label}</span>
      <span className="ui-ratingbar-track" aria-hidden="true">
        <span className="ui-ratingbar-fill" style={{ width: pct(current) }} />
        {growing && <span className="ui-ratingbar-range" style={{ left: pct(Math.max(low, current)), width: `calc(${pct(high)} - ${pct(Math.max(low, current))})` }} />}
        <span className="ui-ratingbar-mid" style={{ left: pct(50) }} />
      </span>
      <span className="ui-ratingbar-value">
        <strong>{current}</strong>
        {growing && (
          <span className="ui-ratingbar-pot">
            {low === high ? <span style={{ color: ratingHeat(high) }}>{high}</span> : <>
              <span style={{ color: ratingHeat(low) }}>{low}</span>–<span style={{ color: ratingHeat(high) }}>{high}</span>
            </>}
          </span>
        )}
      </span>
    </div>
  )
}
