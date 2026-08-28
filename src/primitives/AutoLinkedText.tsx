import { Fragment, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react"
import { sportsIdentity, type PlayerId } from "../sports/config"
import { PlayerLink } from "../sports/PlayerLink"
import { extractCandidates, matchKey } from "../sports/playerNames"
import { cn } from "../cn"

const NUM_SPLIT = /(\b\d+\.?\d*%?|\.\d+\b)/g

function renderWithNumbers(text: string, keyPrefix: string): ReactNode[] {
  return text.split(NUM_SPLIT).map((part, i) =>
    /^\d/.test(part) || part.startsWith(".")
      ? <strong key={`${keyPrefix}-n${i}`}>{part}</strong>
      : part,
  )
}

export interface NamedLink {
  name: string
  onClick?: () => void
  href?: string
}

interface Props {
  text: string
  /** Closed set of names to link; deterministic — no guessing what's a name. */
  players?: Array<{ name: string; id: string | number }> | null
  /**
   * Escape hatch for a caller whose linked player is genuinely not a player
   * link. Almost nothing should pass this: a name in AI prose renders as the
   * kit's PlayerLink — headshot, name, the app's own router link — and it used
   * to be REQUIRED, which is why each app supplied its own and one ended up
   * with a headshot and the other with a bare coloured word at a different
   * size. What a linked player looks like is not an app decision.
   */
  renderPlayerLink?: (name: string, id: string | number) => ReactNode
  /**
   * Send a linked player somewhere other than the app's configured playerHref —
   * a simulation's player pages, say. The link still renders the same.
   */
  playerHref?: (id: PlayerId) => string
  /** Wrap each player link — a hover card. Passed through to PlayerLink. */
  wrapPlayer?: (link: ReactElement, id: PlayerId) => ReactElement
  /** Arbitrary named links (teams, tables…) keyed by exact name. */
  links?: NamedLink[]
  className?: string
  /**
   * With no closed `players` set, pull candidate names out of the prose and
   * resolve them through the app's configured resolvePlayer. Off by default:
   * open-world guessing is strictly worse than membership in a known set, so a
   * caller that knows its players should pass them instead. Both apps needed
   * this for AI text where nothing knows the cast in advance.
   */
  resolveFromProse?: boolean
}

/** AI-prose renderer: bolds numbers and turns known player/team names into
    links. Pass `players` (the entities already in scope) for deterministic
    linking; without it, only `links` apply. */
export function AutoLinkedText({
  text,
  players = null,
  renderPlayerLink,
  playerHref,
  wrapPlayer,
  links = [],
  className,
  resolveFromProse = false,
}: Props) {
  const identity = sportsIdentity()
  const [proseIds, setProseIds] = useState<Record<string, PlayerId>>({})

  // Open mode. Only runs when there is no known set to link by membership in.
  // Prose extraction runs even when a known set was passed. It used to be
  // skipped entirely if `players` was an array, so a panel that supplied a
  // roster linked only the names on that roster and silently dropped every
  // other player in the sentence — and an empty roster (not loaded yet) linked
  // nothing at all. One app passed a set and the other did not, which is why
  // the same sentence showed linked players in one and plain text in the other.
  const candidates = useMemo(
    () => (resolveFromProse ? extractCandidates(text) : []),
    [resolveFromProse, text],
  )
  useEffect(() => {
    if (!candidates.length || !identity.resolvePlayer) return
    let alive = true
    Promise.all(
      candidates.map((name) =>
        identity
          .resolvePlayer!(name)
          .then((hit: any) =>
            hit?.id != null && matchKey(hit.name ?? name) === matchKey(name)
              ? ([name, hit.id] as const)
              : null,
          )
          .catch(() => null),
      ),
    ).then((pairs) => {
      if (!alive) return
      const map: Record<string, PlayerId> = {}
      for (const pair of pairs) if (pair) map[pair[0]] = pair[1]
      setProseIds(map)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.join("|")])

  const nameToId = useMemo(() => {
    // Not gated on renderPlayerLink any more: a resolved player links whether
    // or not the caller brought its own renderer.
    if (!players) return proseIds
    // Membership in the known set is authoritative — it is the one form of
    // linking that cannot be wrong — but it layers ON TOP of what prose
    // resolution found rather than replacing it. Longest-name-first so
    // "Mike Johnson" wins over "Johnson".
    const map: Record<string, string | number> = { ...proseIds }
    for (const p of [...players].sort((a, b) => b.name.length - a.name.length)) {
      if (text.includes(p.name)) map[p.name] = p.id
    }
    return map
  }, [players, text, proseIds])

  const linkMap = useMemo(() => {
    const map: Record<string, NamedLink> = {}
    links.forEach((l) => {
      if (l.name && (l.onClick || l.href)) map[l.name] = l
    })
    return map
  }, [links])

  const parts = useMemo(() => {
    if (!text) return []
    const allLinked = [...Object.keys(nameToId), ...Object.keys(linkMap)]
    if (!allLinked.length) return [text]
    const escaped = [...allLinked]
      .sort((a, b) => b.length - a.length)
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    return text.split(new RegExp(`(${escaped.join("|")})`, "g"))
  }, [text, nameToId, linkMap])

  return (
    <span className={cn(className)}>
      {parts.map((part, i) => {
        const playerId = nameToId[part]
        if (playerId != null) {
          if (renderPlayerLink) {
            return <Fragment key={`pl-${i}`}>{renderPlayerLink(part, playerId)}</Fragment>
          }
          // One rendering of a player named in AI prose, for every app: the
          // headshot, the name, the app's own router link.
          return (
            <PlayerLink
              key={`pl-${i}`}
              player={{ id: playerId, name: part }}
              size={16}
              photoSize={48}
              stopPropagation
              className="ui-autolink-player"
              href={playerHref ? playerHref(playerId) : undefined}
              wrap={wrapPlayer}
            />
          )
        }
        const named = linkMap[part]
        if (named?.href) {
          return (
            <a key={`ln-${i}`} href={named.href} className="ui-autolink">
              {part}
            </a>
          )
        }
        if (named?.onClick) {
          return (
            <button key={`lb-${i}`} type="button" onClick={named.onClick} className="ui-autolink">
              {part}
            </button>
          )
        }
        return <Fragment key={`p-${i}`}>{renderWithNumbers(part, String(i))}</Fragment>
      })}
    </span>
  )
}
