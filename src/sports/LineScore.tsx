import type { ReactNode } from "react"
import { TeamIcon } from "./TeamIcon"

/**
 * A game's score by period, for every sport: the periods carry their own
 * labels, so nine innings, four quarters and overtime all fit one table, and
 * whatever comes after the periods (T, or R / H / E) is a list of totals.
 * Replaces the three hand-built line scores the apps had.
 *
 *   <LineScore away={…} home={…}
 *     periods={[{ label: "1", away: 0, home: 2 }, …]}           // baseball
 *     totals={[{ label: "R", away: 3, home: 4, strong: true }, { label: "H", … }, { label: "E", … }]}
 *     minPeriods={9} highlightScoring />
 *
 *   <LineScore … periods={quarters}   // Q1…Q4, OT
 *     totals={[{ label: "T", away: 24, home: 27, strong: true }]} dimLoser />
 */
export interface LineScorePeriod {
  label: ReactNode
  away?: number | string | null
  home?: number | string | null
  /** The period being played now (live games). */
  current?: boolean
}

export interface LineScoreSide {
  teamId?: string | number | null
  /** Short name in the row: "BKN", "PIT". */
  name: string
}

export interface LineScoreTotal {
  label: string
  away: ReactNode
  home: ReactNode
  /** The score itself (T, R): set in bold. */
  strong?: boolean
}

export interface LineScoreProps {
  away: LineScoreSide
  home: LineScoreSide
  periods: LineScorePeriod[]
  totals: LineScoreTotal[]
  /** Pad to at least this many period columns; unplayed ones show "·". */
  minPeriods?: number
  /** Embolden a period in which a side scored (baseball's runs). */
  highlightScoring?: boolean
  /** Mute the losing side's strong totals. */
  dimLoser?: boolean
  /** Smaller, for sitting inside a game's header. */
  compact?: boolean
  /** Crests beside the names (needs teamId and configureSports' logoUrl). */
  logos?: boolean
  className?: string
}

const num = (v: unknown) => (typeof v === "number" ? v : Number(v))

export function LineScore({ away, home, periods, totals, minPeriods = 0, highlightScoring, dimLoser, compact, logos, className }: LineScoreProps) {
  const padded: LineScorePeriod[] = [...periods]
  for (let i = periods.length; i < minPeriods; i++) padded.push({ label: String(i + 1) })
  const strong = totals.find((t) => t.strong)
  const lost = (side: "away" | "home") => {
    if (!dimLoser || !strong) return false
    const a = num(strong.away), h = num(strong.home)
    if (!Number.isFinite(a) || !Number.isFinite(h) || a === h) return false
    return side === "away" ? a < h : h < a
  }

  const row = (side: "away" | "home", team: LineScoreSide) => (
    <tr className="ui-tr">
      <td className="ui-linescore-team">
        <span className="ui-linescore-teamcell">
          {logos && <TeamIcon teamId={team.teamId} name={team.name} size={compact ? 16 : 20} />}
          <span>{team.name}</span>
        </span>
      </td>
      {padded.map((p, i) => {
        const v = p[side]
        const scored = highlightScoring && v != null && num(v) > 0
        return (
          <td key={i} className={`ui-linescore-cell${scored ? " ui-linescore-cell--scored" : ""}${p.current ? " ui-linescore-cell--current" : ""}`}>
            {v ?? "·"}
          </td>
        )
      })}
      <td className="ui-linescore-gap" aria-hidden="true" />
      {totals.map((t) => (
        <td key={t.label} className={`ui-linescore-total${t.strong ? " ui-linescore-total--strong" : ""}${t.strong && lost(side) ? " ui-linescore-total--lost" : ""}`}>
          {t[side] ?? "–"}
        </td>
      ))}
    </tr>
  )

  return (
    <div className={`ui-tablescroll ui-linescore-wrap${className ? ` ${className}` : ""}`}>
      <table className={`ui-table ui-linescore${compact ? " ui-linescore--compact" : ""}`}>
        <thead>
          <tr>
            <th className="ui-th ui-linescore-teamhead" />
            {padded.map((p, i) => <th key={i} className={`ui-th${p.current ? " ui-linescore-head--current" : ""}`}>{p.label}</th>)}
            <th className="ui-th ui-linescore-gap" aria-hidden="true" />
            {totals.map((t) => <th key={t.label} className="ui-th">{t.label}</th>)}
          </tr>
        </thead>
        <tbody>{row("away", away)}{row("home", home)}</tbody>
      </table>
    </div>
  )
}
