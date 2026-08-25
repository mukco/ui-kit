import { Fragment, useMemo, type ReactNode } from "react"
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
  /** Render the link for a resolved player (router Link, hover card…). */
  renderPlayerLink?: (name: string, id: string | number) => ReactNode
  /** Arbitrary named links (teams, tables…) keyed by exact name. */
  links?: NamedLink[]
  className?: string
}

/** AI-prose renderer: bolds numbers and turns known player/team names into
    links. Pass `players` (the entities already in scope) for deterministic
    linking; without it, only `links` apply. */
export function AutoLinkedText({ text, players = null, renderPlayerLink, links = [], className }: Props) {
  const nameToId = useMemo(() => {
    if (!players || !renderPlayerLink) return {}
    // Link by membership in the known set, longest-name-first so "Mike Johnson"
    // wins over "Johnson".
    const map: Record<string, string | number> = {}
    for (const p of [...players].sort((a, b) => b.name.length - a.name.length)) {
      if (text.includes(p.name)) map[p.name] = p.id
    }
    return map
  }, [players, text, renderPlayerLink])

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
        if (playerId != null && renderPlayerLink) {
          return <Fragment key={`pl-${i}`}>{renderPlayerLink(part, playerId)}</Fragment>
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
