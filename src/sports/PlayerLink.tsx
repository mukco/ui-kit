import { useEffect, useState, type ReactElement, type ReactNode } from "react"
import { cn } from "../cn"
import { Avatar } from "../primitives/Avatar"
import { sportsIdentity, type PlayerId } from "./config"

interface Props {
  /** The player. An id links; a name alone resolves via resolvePlayer if configured. */
  player: { id?: PlayerId | null; name?: string | null }
  /** Photo size in px. */
  size?: number
  /** Hide the name, avatar only. */
  avatarOnly?: boolean
  /**
   * Name used to resolve a missing id, when it differs from the displayed one —
   * a row that shows an abbreviation but should still resolve the full name.
   */
  resolveName?: string | null
  className?: string
  imageClassName?: string
  textClassName?: string
  /**
   * Stop the click reaching an enclosing clickable card. Player names sit
   * inside game tiles and table rows that are themselves links; without this
   * the row's navigation wins and you never reach the player.
   */
  stopPropagation?: boolean
  /**
   * Wrap the rendered link — a hover card, a tooltip, a context menu. The kit
   * has no business knowing what an app shows on hover, but it should not force
   * the app to reimplement the link to get one.
   */
  wrap?: (link: ReactElement, id: PlayerId) => ReactElement
  /**
   * Passed through to photoUrl. Baseball uses it to choose between MLB and
   * minor-league photo sets; another sport may not need it at all.
   */
  photoVariant?: string
  /** Ring the avatar — a player whose game is in progress. */
  live?: boolean
}

/**
 * Player identity line: headshot + name, linked to the player's page when the
 * app configured playerHref. With no id but a name, resolves once.
 *
 * Both consuming apps hand-rolled this before, and the differences that kept
 * them from adopting it were all extension points rather than behaviour: a
 * hover card, stopPropagation inside a clickable row, and a photo-set variant.
 * Those are `wrap`, `stopPropagation` and `photoVariant`. Resolution goes
 * through `resolvePlayer`, so an app that wants it cached supplies a cached
 * implementation rather than the kit growing a query library.
 */
export function PlayerLink({
  player,
  size = 28,
  avatarOnly = false,
  resolveName,
  className,
  imageClassName,
  textClassName,
  stopPropagation = false,
  wrap,
  photoVariant,
  live = false,
}: Props) {
  const identity = sportsIdentity()
  const [resolved, setResolved] = useState<PlayerId | null>(null)

  const name = player.name ?? null
  const lookupName = resolveName ?? name
  let effectiveId: PlayerId | null =
    player.id != null && player.id !== "" ? (player.id as PlayerId) : null

  const needsLookup = effectiveId == null && !!lookupName && !!identity.resolvePlayer
  useEffect(() => {
    if (!needsLookup || !lookupName || !identity.resolvePlayer) return
    let alive = true
    identity.resolvePlayer(lookupName).then((match) => {
      if (alive && match?.id != null) setResolved(match.id)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsLookup, lookupName])

  if (effectiveId == null && resolved != null) effectiveId = resolved

  const href = effectiveId != null && identity.playerHref ? identity.playerHref(effectiveId) : null
  // photoUrl is asked even without an id: its signature takes null precisely so
  // an app whose CDN serves a generic silhouette can return one, and a row then
  // holds its avatar's space instead of jittering as images resolve. An app
  // with no such placeholder returns "" and Avatar falls back to initials.
  const photo = identity.photoUrl(effectiveId, size, photoVariant)

  const face = (
    <Avatar
      name={name}
      src={photo || null}
      size={size}
      className={cn(live && "ui-player-avatar--live", imageClassName)}
    />
  )
  const label: ReactNode =
    !avatarOnly && name ? <span className={cn("ui-player-name", textClassName)}>{name}</span> : null
  const body = (
    <>
      {face}
      {label}
    </>
  )

  if (href == null || effectiveId == null) {
    return <span className={cn("ui-player", className)}>{body}</span>
  }

  const onClick = stopPropagation ? (e: { stopPropagation: () => void }) => e.stopPropagation() : undefined

  const link = identity.link ? (
    identity.link({ href, className: cn("ui-player", className), children: body, onClick })
  ) : (
    <a className={cn("ui-player", className)} href={href} onClick={onClick}>
      {body}
    </a>
  )

  return wrap ? wrap(link, effectiveId) : link
}
