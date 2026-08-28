import { sportsIdentity } from "./config"
import { TeamIcon } from "./TeamIcon"

interface Props {
  /** Absent or null → the crest falls back to initials and nothing links.
      A roster row whose team could not be resolved is a normal state, not a
      caller error. */
  teamId?: string | number | null
  name: string
  size?: number
  /** Applied to the name only — a table row that wants one team's name
      emphasized (the row's own team, say) without resizing its icon. */
  textClassName?: string
}

/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export function TeamLink({ teamId, name, size = 18, textClassName }: Props) {
  const identity = sportsIdentity()
  const href = teamId == null ? undefined : identity.teamHref?.(teamId)
  const face = <TeamIcon teamId={teamId} size={size} name={name} />
  const label = textClassName ? <span className={textClassName}>{name}</span> : name
  const body = (
    <>
      {face}
      {label}
    </>
  )
  if (href) {
    // `link` when the app gave us one — a plain <a> reloads the whole app.
    return identity.link
      ? identity.link({ href, className: "ui-team-link", children: body })
      : (
        <a className="ui-team-link" href={href}>
          {body}
        </a>
      )
  }
  return <span className="ui-team-link">{body}</span>
}
