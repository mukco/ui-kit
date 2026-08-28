import { useState } from "react"
import type { ReactNode } from "react"
import { cn } from "../cn"

export interface MatchupSide {
  name: string
  /** Logo image URL; falls back to initials when absent or on error. */
  logoUrl?: string | null
  score?: ReactNode
  /** e.g. "63-71". Rendered under the name. */
  record?: ReactNode
}

interface Props {
  away: MatchupSide
  home: MatchupSide
  /** The state chip's content — "Final", "7:05 PM", "Top 4". */
  status?: ReactNode
  tone?: "live" | "final" | "upcoming"
  /** Extra chips beside the status — a watch link, a broadcast badge. */
  badges?: ReactNode
  /** Right of the header: venue, week, round. */
  meta?: ReactNode
  /** Background photograph. A scrim goes over it so the card stays legible. */
  art?: string | null
  /**
   * Replaces the score cluster between the two sides. Use it when a game has
   * no score to show — "vs" before first pitch — or when the sport wants its
   * own arrangement of one.
   */
  middle?: ReactNode
  /** The sport's own footer: probable pitchers, spread, possession. */
  foot?: ReactNode
  /** Simple one-line alternative to `foot`. */
  detail?: ReactNode
  /** Draws the selected/favourite outline. */
  highlighted?: boolean
  onClick?: () => void
  className?: string
}

function Side({ side }: { side: MatchupSide }) {
  // A logo URL that 404s has to fall back to initials, not to an empty circle.
  // Hiding the <img> on error is not enough — there is nothing behind it.
  const [broken, setBroken] = useState(false)
  const showImage = !!side.logoUrl && !broken

  return (
    <div className="ui-matchup-side">
      <span className="ui-matchup-logo" aria-hidden="true">
        {showImage ? (
          <img src={side.logoUrl!} alt="" onError={() => setBroken(true)} />
        ) : (
          side.name.slice(0, 2).toUpperCase()
        )}
      </span>
      <span className="ui-matchup-name">{side.name}</span>
      {side.record != null && <span className="ui-matchup-record">{side.record}</span>}
    </div>
  )
}

/**
 * Two sides, a state chip, an optional photograph behind it, and a slot for
 * whatever the sport puts at the bottom.
 *
 * This is the shell only. What goes in `foot` is the app's business —
 * baseball's probable pitchers and lineup toggle, football's spread and
 * possession — but the proportions, the type scale and the way a matchup is
 * laid out live here, so the two cannot drift apart. Two apps hand-rolling
 * this and copying each other's measurements is exactly what it replaces.
 */
export function MatchupCard({
  away,
  home,
  status,
  tone = "upcoming",
  badges,
  meta,
  art,
  middle,
  foot,
  detail,
  highlighted,
  onClick,
  className,
}: Props) {
  // Dim the side that is behind, once there is a result to be behind in.
  //
  // This used to compute `homeWins` and then dim away-when-homeWins,
  // home-when-not. With tone "upcoming" homeWins is false, so the home score
  // was dimmed in every game that had not started — a losing side in a game
  // with no score. It also only ever applied at "final", so a live game
  // showed both scores equally weighted.
  const decided =
    tone !== "upcoming" &&
    home.score != null &&
    away.score != null &&
    Number(home.score) !== Number(away.score)
  const awayBehind = decided && Number(away.score) < Number(home.score)
  const homeBehind = decided && Number(home.score) < Number(away.score)

  const body = (
    <>
      {art && (
        <div aria-hidden="true" className="ui-matchup-art" style={{ backgroundImage: `url(${art})` }}>
          <div className="ui-matchup-scrim" />
        </div>
      )}

      {(status != null || badges || meta) && (
        <div className="ui-matchup-head">
          {status != null && <span className={`ui-matchup-status ui-matchup-status--${tone}`}>{status}</span>}
          {badges}
          {meta && <span className="ui-matchup-meta">{meta}</span>}
        </div>
      )}

      <div className="ui-matchup-body">
        <Side side={away} />
        <div className="ui-matchup-mid">
          {middle ?? (
            <span className="ui-matchup-score">
              <span className={cn(awayBehind && "ui-matchup-loser")}>{away.score ?? "–"}</span>
              <span className="ui-matchup-sep">–</span>
              <span className={cn(homeBehind && "ui-matchup-loser")}>{home.score ?? "–"}</span>
            </span>
          )}
        </div>
        <Side side={home} />
      </div>

      {(foot || detail) && (
        <div className="ui-matchup-foot">
          {foot ?? <p className="ui-matchup-detail">{detail}</p>}
        </div>
      )}
    </>
  )

  const classes = cn("ui-card", "ui-matchup", onClick && "ui-matchup--link", highlighted && "ui-matchup--on", className)

  // A button element cannot legally contain the interactive controls apps put
  // in `foot` (baseball's lineup toggle, a watch link), so a clickable card is
  // a div with a button role rather than a real <button>.
  if (onClick) {
    return (
      <div
        className={classes}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {body}
      </div>
    )
  }
  return <div className={classes}>{body}</div>
}
