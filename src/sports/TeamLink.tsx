import { sportsIdentity } from "./config"
import { TeamIcon } from "./TeamIcon"

interface Props {
  teamId: string | number
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
  const href = sportsIdentity().teamHref?.(teamId)
  const face = <TeamIcon teamId={teamId} size={size} />
  const label = textClassName ? <span className={textClassName}>{name}</span> : name
  if (href) {
    return (
      <a className="ui-team-link" href={href}>
        {face}
        {label}
      </a>
    )
  }
  return (
    <span className="ui-team-link">
      {face}
      {label}
    </span>
  )
}
