import { useMemo, useState, type ReactNode } from "react"
import { cn } from "../cn"
import { Tabs } from "../primitives/Tabs"
import { SegmentedControl } from "../primitives/SegmentedControl"
import { TeamIcon } from "./TeamIcon"

/**
 * A game's plays, for every sport: one row per play — when, whose, what — with
 * the running score, a switch between the scoring plays and all of them, and
 * a tab per period. Replaces three hand-built feeds (Hoops' quarter tabs,
 * football's scoring plays and all-plays list, baseball's scoring plays and
 * all-plays list).
 *
 * The sport's detail goes in `head`: football's "TD +6 · Passing Touchdown",
 * baseball's batter, RBI and event. `text` is the play itself.
 *
 * Plays arrive in game order; the feed shows them newest first while the game
 * is live (`newestFirst`) so the latest play is at the top.
 */
export interface FeedPlay {
  id: string | number
  /** The period it belongs to; matches a key in `periods`. */
  period: string | number
  /** "2:59", "▲ 7". */
  when?: ReactNode
  teamId?: string | number | null
  teamName?: string | null
  /** A line above the text: a scoring badge, the batter and the event. */
  head?: ReactNode
  text: ReactNode
  /** The score after the play. */
  score?: { away: number | string; home: number | string } | null
  scoring?: boolean
  /** Small marks after the text — "TO", "PEN". */
  flags?: ReactNode
}

export interface PlayFeedProps {
  plays: FeedPlay[]
  /** Tab per period, in order: [{ key: 1, label: "Q1" }, …]. A "Game" tab precedes them. */
  periods: Array<{ key: string | number; label: string }>
  newestFirst?: boolean
  /** Start on all plays rather than the scoring ones. */
  defaultAll?: boolean
  className?: string
}

const GAME = "__game"

export function PlayFeed({ plays, periods, newestFirst, defaultAll, className }: PlayFeedProps) {
  const [period, setPeriod] = useState(GAME)
  const [mode, setMode] = useState(defaultAll ? "all" : "scoring")
  const anyScoring = plays.some((p) => p.scoring)
  const effectiveMode = anyScoring ? mode : "all"

  const shown = useMemo(() => {
    const rows = plays.filter((p) => (period === GAME || String(p.period) === period) && (effectiveMode === "all" || p.scoring))
    return newestFirst ? [...rows].reverse() : rows
  }, [plays, period, effectiveMode, newestFirst])

  if (plays.length === 0) return null
  const present = new Set(plays.map((p) => String(p.period)))
  const tabs = [{ id: GAME, label: "Game" }, ...periods.filter((p) => present.has(String(p.key))).map((p) => ({ id: String(p.key), label: p.label }))]

  return (
    <div className={cn("ui-playfeed", className)}>
      <div className="ui-playfeed-controls">
        <Tabs tabs={tabs} active={period} onChange={setPeriod} />
        {anyScoring && (
          <SegmentedControl
            options={[{ id: "scoring", label: "Scoring" }, { id: "all", label: "All" }]}
            active={mode}
            onChange={setMode}
          />
        )}
      </div>
      {shown.length === 0 ? (
        <p className="ui-playfeed-empty">No {effectiveMode === "scoring" ? "scoring plays" : "plays"} in this period.</p>
      ) : (
        <ol className="ui-playfeed-list">
          {shown.map((p) => (
            <li key={p.id} className={cn("ui-playfeed-play", p.scoring && "ui-playfeed-play--scoring")}>
              <span className="ui-playfeed-when">{p.when}</span>
              <span className="ui-playfeed-team">
                {(p.teamId != null || p.teamName) && <TeamIcon teamId={p.teamId} name={p.teamName} size={18} />}
              </span>
              <span className="ui-playfeed-head">{p.head}</span>
              <span className="ui-playfeed-score">{p.score ? `${p.score.away}–${p.score.home}` : ""}</span>
              <span className="ui-playfeed-text">{p.text}{p.flags && <> {p.flags}</>}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** A small mark for a play's head or flags: "TD +6", "2 RBI", "TO". */
export function PlayTag({ children, tone }: { children: ReactNode; tone?: "score" | "bad" }) {
  return <span className={cn("ui-playtag", tone && `ui-playtag--${tone}`)}>{children}</span>
}
