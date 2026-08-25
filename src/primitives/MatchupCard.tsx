import type { ReactNode } from "react"
import { cn } from "../cn"

export interface MatchupSide {
  name: string
  /** Logo image URL; falls back to initials when absent. */
  logoUrl?: string | null
  score?: ReactNode
}

interface Props {
  away: MatchupSide
  home: MatchupSide
  /** e.g. "Final", "7:05 PM", "Live" */
  status?: string
  tone?: "live" | "final" | "upcoming"
  /** Sport- or app-specific line under the scoreboard (venue, week, pitchers). */
  detail?: ReactNode
  onClick?: () => void
  className?: string
}

function Side({ side }: { side: MatchupSide }) {
  return (
    <div className="ui-matchup-side">
      <span className="ui-matchup-logo" aria-hidden="true">
        {side.logoUrl ? (
          <img src={side.logoUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
        ) : (
          side.name.slice(0, 2).toUpperCase()
        )}
      </span>
      <span className="ui-matchup-name">{side.name}</span>
    </div>
  )
}

/** Two sides, a state chip, optional detail line. Games, series, trivia
    matchups — anything that is "these two, at it". */
export function MatchupCard({ away, home, status, tone = "upcoming", detail, onClick, className }: Props) {
  const homeWins =
    tone === "final" &&
    home.score != null &&
    away.score != null &&
    Number(home.score) !== Number(away.score)
  const body = (
    <>
      <div className="ui-matchup-row">
        <Side side={away} />
        <div className="ui-matchup-mid">
          <span className={`ui-matchup-status ui-matchup-status--${tone}`}>{status ?? ""}</span>
          <span className="ui-matchup-score">
            <span className={cn(homeWins && "ui-matchup-loser")}>{away.score ?? "–"}</span>
            <span className="ui-matchup-sep">·</span>
            <span className={cn(!homeWins && "ui-matchup-loser")}>{home.score ?? "–"}</span>
          </span>
        </div>
        <Side side={home} />
      </div>
      {detail && <p className="ui-matchup-detail">{detail}</p>}
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={cn("ui-card ui-matchup", "ui-matchup--link", className)} onClick={onClick}>
        {body}
      </button>
    )
  }
  return (
    <div className={cn("ui-card ui-matchup", className)}>
      {body}
    </div>
  )
}
