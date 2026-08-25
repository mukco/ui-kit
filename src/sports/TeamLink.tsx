import { sportsIdentity } from "./config"
import { TeamIcon } from "./TeamIcon"

interface Props {
  teamId: string | number
  name: string
  size?: number
}

/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export function TeamLink({ teamId, name, size = 18 }: Props) {
  const href = sportsIdentity().teamHref?.(teamId)
  const face = <TeamIcon teamId={teamId} size={size} />
  if (href) {
    return (
      <a className="ui-team-link" href={href}>
        {face}
        {name}
      </a>
    )
  }
  return (
    <span className="ui-team-link">
      {face}
      {name}
    </span>
  )
}
