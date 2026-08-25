import { cn } from "../cn"

export interface GaugeStat {
  label: string
  value: React.ReactNode
  percentile: number | null | undefined
  category?: string
  /** Descriptive stat: flat muted bar, no good/bad implication. */
  neutral?: boolean
}

function pctColor(p: number): string {
  if (p >= 85) return "var(--stat-elite)"
  if (p >= 65) return "var(--stat-great)"
  if (p >= 40) return "var(--stat-avg)"
  if (p >= 20) return "var(--stat-below)"
  return "var(--stat-poor)"
}

const NEUTRAL = "var(--muted)"

const ZONES = [
  { from: 0, to: 20, fill: "var(--stat-poor)" },
  { from: 20, to: 40, fill: "var(--stat-below)" },
  { from: 40, to: 65, fill: "var(--stat-avg)" },
  { from: 65, to: 85, fill: "var(--stat-great)" },
  { from: 85, to: 100, fill: "var(--stat-elite)" },
]

const TICKS = [25, 50, 75]

function GaugeRow({ label, value, percentile, neutral }: GaugeStat) {
  if (percentile == null) return null
  const color = neutral ? NEUTRAL : pctColor(percentile)
  const bubbleLeft = Math.max(4, Math.min(96, percentile))

  return (
    <div className="ui-gaugerow">
      <span className="ui-gauge-label">{label}</span>
      <span className="ui-mono ui-gauge-value">{value ?? "—"}</span>

      <div className="ui-gauge-trackwrap">
        {neutral ? (
          <div className="ui-gauge-track" style={{ backgroundColor: NEUTRAL }} />
        ) : (
          <div className="ui-gauge-track">
            {ZONES.map((z) => (
              <div key={z.from} className="ui-gauge-zone" style={{ left: `${z.from}%`, width: `${z.to - z.from}%`, backgroundColor: z.fill }} />
            ))}
          </div>
        )}

        {TICKS.map((t) => (
          <div key={t} className="ui-gauge-tick" style={{ left: `${t}%` }} />
        ))}

        <div className="ui-gauge-bubble" style={{ left: `${bubbleLeft}%`, backgroundColor: color }} title={`${percentile}th percentile`}>
          <span>{percentile}</span>
        </div>
      </div>
    </div>
  )
}

/** Percentile sliders: label · value · a track banded poor→elite with the
    percentile riding the bar as a bubble. Grouped by category, sorted
    best→worst within each group. */
export function PercentileGauge({ stats = [], className }: { stats?: GaugeStat[]; className?: string }) {
  const visible = stats.filter((s) => s.percentile != null)
  if (!visible.length) return null

  const order: string[] = []
  const groups: Record<string, GaugeStat[]> = {}
  for (const s of visible) {
    const cat = s.category ?? ""
    if (!groups[cat]) {
      groups[cat] = []
      order.push(cat)
    }
    groups[cat].push(s)
  }
  for (const cat of order) {
    groups[cat].sort((a, b) => (a.neutral || b.neutral ? 0 : (b.percentile ?? 0) - (a.percentile ?? 0)))
  }

  return (
    <div className={cn("ui-gauge", className)}>
      <div className="ui-gaugerow ui-gauge-headrow">
        <span />
        <span className="ui-sb-label">Value</span>
        <div className="ui-gauge-scale">
          {[0, 25, 50, 75, 100].map((t) => (
            <span key={t} style={{ left: `${Math.max(2, Math.min(98, t))}%` }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {order.map((cat) => (
        <div key={cat || "_"}>
          {cat && <div className="ui-gauge-cat">{cat}</div>}
          <div>
            {groups[cat].map((s) => (
              <GaugeRow key={s.label} {...s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
