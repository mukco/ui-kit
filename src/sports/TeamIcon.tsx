import { sportsIdentity } from "./config"

interface Props {
  teamId: string | number
  /** Rendered size in px. */
  size?: number
}

/** A team's crest from the app-configured logoUrl. */
export function TeamIcon({ teamId, size = 20 }: Props) {
  const identity = sportsIdentity()
  return (
    <img
      className="ui-team-icon"
      src={identity.logoUrl(teamId)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
    />
  )
}
