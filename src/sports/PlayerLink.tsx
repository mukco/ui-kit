import { useEffect, useState } from "react"
import { Avatar } from "../primitives/Avatar"
import { sportsIdentity, type PlayerId } from "./config"

interface Props {
  /** The player. An id links; a name alone resolves via resolvePlayer if configured. */
  player: { id?: PlayerId | null; name?: string | null }
  /** Photo size in px. */
  size?: number
  /** Hide the name, avatar only. */
  avatarOnly?: boolean
}

/**
 * Player identity line: headshot + name, linked to the player's page when the
 * app configured playerHref. With no id but a name, resolves once.
 */
export function PlayerLink({ player, size = 28, avatarOnly = false }: Props) {
  const identity = sportsIdentity()
  const [resolved, setResolved] = useState<PlayerId | null>(null)

  const name = player.name ?? null
  let effectiveId: PlayerId | null =
    player.id != null && player.id !== "" ? (player.id as PlayerId) : null

  const needsLookup = effectiveId == null && !!name && !!identity.resolvePlayer
  useEffect(() => {
    if (!needsLookup || !name || !identity.resolvePlayer) return
    let alive = true
    identity.resolvePlayer(name).then((match) => {
      if (alive && match?.id != null) setResolved(match.id)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsLookup, name])

  if (effectiveId == null && resolved != null) effectiveId = resolved

  const href = effectiveId != null && identity.playerHref ? identity.playerHref(effectiveId) : null
  const photo = effectiveId != null ? identity.photoUrl(effectiveId, size) : ""

  const face = <Avatar name={name} src={photo || null} size={size} />
  const label = !avatarOnly && name ? <span className="ui-player-name">{name}</span> : null
  const body = (
    <>
      {face}
      {label}
    </>
  )

  if (href) {
    // `link` when the app gave us one — a plain <a> reloads the whole app.
    return identity.link
      ? identity.link({ href, className: "ui-player", children: body })
      : (
        <a className="ui-player" href={href}>
          {body}
        </a>
      )
  }
  return <span className="ui-player">{body}</span>
}
