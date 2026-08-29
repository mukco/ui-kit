import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { TeamIcon } from "./TeamIcon"

/**
 * A division's win-percentage race over a season, as a line chart, plus a
 * legend of current standing.
 *
 * Ported from baseball's — the one app whose version worked. Football's own
 * copy rendered blank: it wrapped the chart in an extra `flex: 1` div inside
 * `Panel`'s `.ui-panel-scroll`, which is a flex *item* of `.ui-panel`, not a
 * flex *container* itself — so the inner div's `flex: 1 1 0%` had no flex
 * parent to size against and collapsed to 0 height. This component owns no
 * wrapper of its own beyond that one `flex: 1; min-height: 0` div, and is
 * meant to sit as a *direct* child of `Panel` with `scroll={false}` — same
 * shape baseball always used, just via the shared component instead of a
 * hand-rolled `ui-card ui-panel` div.
 */

export interface RaceTeam {
  teamId: number
  teamAbbr?: string
  /** Hex team color. Brightened for legibility — see brightenForDark below. */
  color?: string
  /** One point per completed game. `date` is a label, not necessarily a
      parseable date — football's is `"W4"` (a week number), baseball's is an
      ISO date string. Pass `formatLabel` to control how it renders. */
  series: Array<{ date: string; winPct: number }>
}

// Team brand colors are tuned for light backgrounds — brighten them so they
// stay legible against the chart's dark-surface tooltip and legend text.
function brightenForDark(hex: string | undefined) {
  if (!hex || hex.length < 7) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const blend = (c: number) => Math.round(c + (255 - c) * 0.55)
  return `rgb(${blend(r)},${blend(g)},${blend(b)})`
}

export function DivisionRaceChart({
  divisionRace,
  favTeamId,
  /** Y-axis bounds. Baseball's teams cluster near .500 over a long season, so
      [0.3, 0.7] reads better zoomed in; a shorter season (or a blowout
      division) wants the full [0, 1] so a leader or a winless team is not
      pinned to the axis edge. */
  domain = [0.3, 0.7],
  /** How a series point's `date` renders on the x-axis and in the tooltip.
      Identity by default — pass a formatter for a parseable date string
      (e.g. `(d) => format(parseISO(d), 'M/d')`). */
  formatLabel = (d: string) => d,
}: {
  divisionRace?: RaceTeam[]
  favTeamId: number
  domain?: [number, number]
  formatLabel?: (date: string) => string
}) {
  if (!divisionRace?.length) {
    return <div className="ui-race-none">No data</div>
  }

  const allDates = [...new Set(divisionRace.flatMap(t => t.series.map(p => p.date)))].sort()

  const withColors = divisionRace.map(t => ({ ...t, displayColor: brightenForDark(t.color) }))

  const filled = withColors.map(team => {
    const byDate = Object.fromEntries(team.series.map(p => [p.date, p.winPct]))
    let last = 0.5
    return {
      ...team,
      byDate: Object.fromEntries(allDates.map(d => {
        if (byDate[d] !== undefined) last = byDate[d]
        return [d, last]
      })),
    }
  })

  const chartData = allDates.map(date => {
    const pt: Record<string, string | number> = { date }
    filled.forEach(t => { pt[`t${t.teamId}`] = t.byDate[date] })
    return pt
  })
  const step = Math.max(1, Math.floor(allDates.length / 4))

  const legendSorted = [...filled].sort((a, b) => {
    const aLast = a.series[a.series.length - 1]?.winPct ?? 0
    const bLast = b.series[b.series.length - 1]?.winPct ?? 0
    return bLast - aLast
  })

  // Tick fill comes from the stylesheet so it follows the theme.
  const AXIS_TICK = { fontSize: 9 }

  return (
    <>
      <div className="ui-race-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 0, left: -28 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(d: string, i: number) => (i % step === 0 ? formatLabel(d) : "")}
              tick={AXIS_TICK} axisLine={false} tickLine={false}
            />
            <YAxis
              domain={domain}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              tick={AXIS_TICK} axisLine={false} tickLine={false}
            />
            <Tooltip content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null
              const sorted = [...payload].sort((a: any, b: any) => (b.value as number) - (a.value as number))
              const teamById = Object.fromEntries(filled.map(t => [`t${t.teamId}`, t]))
              return (
                <div className="ui-race-tip">
                  <div className="ui-race-tip-date">{formatLabel(label)}</div>
                  {sorted.map((p: any) => {
                    const team = teamById[String(p.dataKey)]
                    return (
                      <div key={p.dataKey} className="ui-race-tip-row">
                        {team && <TeamIcon teamId={team.teamId} size={14} name={team.teamAbbr} />}
                        <span className="ui-race-tip-name">{team?.teamAbbr}</span>
                        <span className="ui-race-tip-val">{((p.value as number) * 100).toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              )
            }} />
            {filled.map(t => (
              <Line
                key={t.teamId} type="monotone" dataKey={`t${t.teamId}`} name={t.teamAbbr}
                stroke={t.displayColor} strokeWidth={t.teamId === favTeamId ? 2.5 : 1.5}
                dot={false} opacity={t.teamId === favTeamId ? 1 : 0.65}
                strokeDasharray={t.teamId === favTeamId ? undefined : "4 2"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="ui-race-legend">
        {legendSorted.map(t => (
          <div key={t.teamId} className="ui-race-legend-item">
            <TeamIcon teamId={t.teamId} size={14} name={t.teamAbbr} />
            <span
              className="ui-race-legend-abbr"
              style={{ color: t.displayColor, opacity: t.teamId === favTeamId ? 1 : 0.8 }}
            >
              {t.teamAbbr}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
