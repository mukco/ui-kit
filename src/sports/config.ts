import type { ReactElement, ReactNode } from "react"

/**
 * Sport identity adapters. Kit components never hardcode where photos, logos,
 * or player pages live; each app configures that once at boot and futbol is a
 * new config object, not a fork.
 *
 * Set it in the app entrypoint:
 *
 *   configureSports({
 *     photoUrl: (id, size) => `https://cdn.example/players/${id}.png?w=${size}`,
 *     logoUrl: (teamId) => `https://cdn.example/teams/${teamId}.svg`,
 *   })
 */

export type PlayerId = number | string

/** What the kit needs to render one internal link. */
export interface KitLinkProps {
  href: string
  className?: string
  children: ReactNode
  /** Set when the link sits inside a clickable row and must not trigger it. */
  onClick?: (e: { stopPropagation: () => void }) => void
}

export interface SportsIdentity {
  /** Headshot/photo URL for a player id (0/unknown should return a silhouette). */
  /** `variant` selects a photo set where a sport has more than one (baseball's
      MLB vs minor-league headshots); ignore it where there is only one. */
  photoUrl: (id: PlayerId | null | undefined, size?: number, variant?: string) => string
  /** Team crest/logo URL for a team id. */
  logoUrl: (teamId: string | number) => string
  /** Where a player profile lives; absent → names render as plain text. */
  playerHref?: (id: PlayerId) => string
  /** Where a team profile lives; absent → teams render unlinked. */
  teamHref?: (teamId: string | number) => string
  /** Name → id resolution for rows that only have a name; absent → no lookup. */
  resolvePlayer?: (name: string) => Promise<{ id: PlayerId } | null>
  /**
   * How this app renders an internal link. Absent → a plain `<a href>`, which
   * in a single-page app is a full page reload rather than a client-side
   * transition — which is why every consumer so far hand-rolled its own
   * TeamLink and PlayerLink instead of using these. Set it once at boot:
   *
   *   import { Link } from "react-router-dom"
   *   configureSports({
   *     link: ({ href, className, children }) => (
   *       <Link to={href} className={className}>{children}</Link>
   *     ),
   *   })
   *
   * Taking a render function rather than a component type keeps the kit free
   * of any router dependency, and free of assumptions about whether the
   * destination prop is called `to` or `href`.
   */
  link?: (props: KitLinkProps) => ReactElement
}

const IDENTITY: SportsIdentity = {
  photoUrl: () => "",
  logoUrl: () => "",
}

export function configureSports(identity: Partial<SportsIdentity>): void {
  Object.assign(IDENTITY, identity)
}

export function sportsIdentity(): SportsIdentity {
  return IDENTITY
}
