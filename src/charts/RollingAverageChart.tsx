import { useMemo } from "react"
import { ComposedChart, Area, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts"
import type { ChartRow } from "./DynamicChart"
import { fmtDay, fmtShortDay } from "../lib/days"

function rollingAvg(data: ChartRow[], key: string, window: number): Array<ChartRow & { _avg: number | null }> {
  return data.map((d, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1)
    const vals = slice.map((x) => Number(x[key])).filter(Number.isFinite)
    return { ...d, _avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null }
  })
}

const BORDER = "var(--border-strong)"
const MUTED = "var(--muted)"

interface TipProps {
  active?: boolean
  payload?: Array<{ payload?: ChartRow & { _avg?: number | null } }>
  valueKey: string
  valueLabel: string
  formatValue: (v: number) => string
}

function CustomTooltip({ active, payload, valueKey, valueLabel, formatValue }: TipProps) {
  if (!active || !payload?.length) return null
  const d = (payload[0]?.payload ?? {}) as ChartRow & { _avg?: number | null; opponent?: string; isHome?: boolean; date?: string }
  const dateLabel = d.date ? fmtDay(d.date) : ""
  const raw = d[valueKey]
  return (
    <div className="ui-tooltip">
      <p className="ui-tooltip-title">{dateLabel}</p>
      {d.opponent && (
        <p className="ui-tooltip-row">
          {d.isHome ? "vs" : "@"} {d.opponent}
        </p>
      )}
      {raw != null && Number.isFinite(Number(raw)) && (
        <p className="ui-tooltip-row">
          {valueLabel}: <strong>{formatValue(Number(raw))}</strong>
        </p>
      )}
      {d._avg != null && (
        <p className="ui-tooltip-row">
          Rolling: <strong>{d._avg.toFixed(1)}</strong>
        </p>
      )}
    </div>
  )
}

interface Props {
  data?: ChartRow[] | null
  /** Row field to plot. */
  valueKey?: string
  valueLabel?: string
  /** When set, the current value renders inline next to this title in a header
      row instead of floating over the plot; the caller then skips its own title. */
  title?: string | null
  color?: string
  windowSize?: number
  reference?: number | null
  height?: number
  formatValue?: (v: number) => string
}

/**
 * Per-game dots with a rolling-average area line over them — the shape for
 * "how has this been trending lately?"
 */
export function RollingAverageChart({
  data = [],
  valueKey = "ops",
  valueLabel = "OPS",
  title = null,
  color = "var(--brand)",
  windowSize = 10,
  reference = null,
  height = 200,
  formatValue = (v) => Number(v).toFixed(3),
}: Props) {
  const processed = useMemo(() => rollingAvg(data ?? [], valueKey, windowSize), [data, valueKey, windowSize])

  const vals = processed.map((d) => Number(d[valueKey])).filter(Number.isFinite)
  if (!vals.length) return <div className="ui-chart-empty">No data</div>

  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = Math.max((max - min) * 0.12, 0.05)

  const tickData = processed.map((d, i) => {
    let label = String(i + 1)
    if (typeof d.date === "string") label = fmtShortDay(d.date)
    return { ...d, _idx: i, _label: label }
  })

  const step = Math.max(1, Math.floor(tickData.length / 6))
  const ticks = tickData.filter((_, i) => i % step === 0).map((d) => d._idx)
  const gradId = `ui-ra-${valueKey}`

  // Current rolling value + net change across the span; level and direction
  // together tell the story.
  const avgs = processed.map((d) => d._avg).filter((v): v is number => v != null && Number.isFinite(v))
  const current = avgs.length ? avgs[avgs.length - 1] : null
  const delta = avgs.length >= 2 ? avgs[avgs.length - 1] - avgs[0] : null

  const valueChip =
    current == null ? null : (
      <span className="ui-chip">
        <span className="ui-chip-value" title={`Current ${valueLabel} (rolling avg)`}>
          {formatValue(current)}
        </span>
        {delta != null && Math.abs(delta) > 0 && (
          <span
            className="ui-chip-delta"
            style={{ color: delta >= 0 ? "var(--stat-great)" : "var(--stat-poor)" }}
            title={`${valueLabel} change over span`}
          >
            {delta >= 0 ? "▲" : "▼"}
            {formatValue(Math.abs(delta))}
          </span>
        )}
      </span>
    )

  return (
    <div>
      {title && (
        <div className="ui-chart-head" style={{ marginBottom: 4 }}>
          <span className="ui-chart-title">{title}</span>
          {valueChip}
        </div>
      )}
      <div style={{ position: "relative" }}>
        {!title && valueChip && (
          <div
            style={{
              position: "absolute",
              left: 36,
              top: 0,
              zIndex: 10,
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
              background: "color-mix(in srgb, var(--surface) 80%, transparent)",
            }}
          >
            {valueChip}
          </div>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={tickData} margin={{ top: 8, right: 12, bottom: 16, left: -8 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={BORDER} strokeDasharray="3 3" strokeOpacity={0.6} vertical={false} />

            <XAxis
              dataKey="_idx"
              type="number"
              domain={[0, tickData.length - 1]}
              ticks={ticks}
              tickFormatter={(i: number) => tickData[i]?._label ?? ""}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={{ stroke: BORDER }}
              tickLine={false}
            />
            <YAxis
              domain={[Math.max(0, min - pad), max + pad]}
              tickFormatter={(v: number) => {
                if (!Number.isFinite(v)) return String(v)
                if (Number.isInteger(v)) return String(v)
                if (Math.abs(v) >= 1) return v.toFixed(1)
                return v.toFixed(2)
              }}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={{ stroke: BORDER }}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip valueKey={valueKey} valueLabel={valueLabel} formatValue={formatValue} />} cursor={{ stroke: BORDER }} />

            {reference != null && <ReferenceLine y={reference} stroke={MUTED} strokeDasharray="4 4" strokeWidth={1} />}

            {/* Individual game dots — faint context behind the trend line */}
            <Scatter dataKey={valueKey} fill={color} fillOpacity={0.18} r={2} line={false} isAnimationActive={false} />

            {/* Rolling average — gradient area fill */}
            <Area
              dataKey="_avg"
              type="monotone"
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              connectNulls
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
