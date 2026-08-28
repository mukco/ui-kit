import type { ReactNode } from "react"
import { cn } from "../cn"
import { age } from "../lib/age"
import { SectionLabel } from "../primitives/SectionLabel"
import { PlayerLink } from "./PlayerLink"
import { TeamLink } from "./TeamLink"
import type { PlayerId } from "./config"

export interface NewsPlayerMention {
  id: PlayerId
  name?: string | null
  headshotUrl?: string | null
}

export interface NewsTeamMention {
  id?: string | number | null
  name?: string | null
  abbreviation?: string | null
  logoUrl?: string | null
}

export interface NewsItem {
  id?: string | number
  title?: string | null
  url?: string | null
  summary?: string | null
  /** Display name of the outlet, used when `sources` has no entry for the key. */
  source?: string | null
  /** Stable key into `sources` — "mlb", "espn", "reddit". */
  sourceKey?: string | null
  publishedAt?: string | null
  mentions?: NewsPlayerMention[] | null
  teamMentions?: NewsTeamMention[] | null
}

/** How one outlet is shown: its name, and the colour of its dot. */
export interface NewsSource {
  label?: string
  /** Any CSS colour — `var(--chart-3)` keeps it on the app's palette. */
  color?: string
}

export interface NewsPanelProps {
  items?: NewsItem[] | null
  /** sourceKey → label and dot colour. Unknown keys fall back to `item.source`. */
  sources?: Record<string, NewsSource>
  limit?: number
  /** Panel heading. `null` renders the list bare, for a caller with its own. */
  title?: ReactNode
  /**
   * A pill after the timestamp — baseball puts an injury there. The kit has no
   * business knowing what an item is flagged for, only where the flag goes.
   */
  renderBadge?: (item: NewsItem) => ReactNode
  /** Fixed panel height; the list scrolls inside it. Absent → grows to fit. */
  height?: string | number
  empty?: string
  className?: string
}

function SourceTag({ item, sources }: { item: NewsItem; sources?: Record<string, NewsSource> }) {
  const meta = (item.sourceKey && sources?.[item.sourceKey]) || null
  const label = meta?.label ?? item.source
  if (!label) return null
  // The colour rides an inline custom property rather than a modifier class, so
  // an app adds an outlet by adding a row to its `sources` map — not a rule to
  // its stylesheet and a branch to a component.
  return (
    <span className="ui-news-src" style={meta?.color ? ({ "--ui-news-src": meta.color } as any) : undefined}>
      <span className="ui-news-dot" />
      <span className="ui-news-srcname">{label}</span>
    </span>
  )
}

/**
 * A list of headlines: outlet, age, title, summary, and the players and teams
 * the story is about as links.
 *
 * This is baseball's panel. Football's rendered the title and a date and threw
 * the other seven fields its own API returns on the floor, which is what made
 * the two dashboards read as different products. Both apps' news items are the
 * same shape field for field — `{id, source, sourceKey, title, url, summary,
 * publishedAt, mentions, teamMentions}` — so there was never a data reason for
 * two components.
 *
 * The chips are PlayerLink and TeamLink, so a mention routes through the app's
 * own `link` and gets the crest/headshot fallbacks for free instead of the raw
 * <img onError> each app had.
 */
export function NewsPanel({
  items,
  sources,
  limit,
  title = "Team News",
  renderBadge,
  height,
  empty = "No news available",
  className,
}: NewsPanelProps) {
  const rows = (items ?? []).slice(0, limit ?? undefined)

  return (
    <div
      className={cn("ui-card ui-news-panel", className)}
      style={height != null ? { height } : undefined}
    >
      {title != null && <SectionLabel>{title}</SectionLabel>}
      <div className="ui-news-scroll">
        {rows.length === 0 && <p className="ui-news-empty">{empty}</p>}
        {rows.map((item, i) => {
          const teams = (item.teamMentions ?? []).filter((t) => t.abbreviation || t.name).slice(0, 3)
          const players = (item.mentions ?? []).filter((m) => m.id != null).slice(0, 4)
          const when = age(item.publishedAt)
          const badge = renderBadge?.(item)
          return (
            <article key={item.id ?? i} className="ui-news-item">
              <div className="ui-news-meta">
                <SourceTag item={item} sources={sources} />
                {when && <span className="ui-news-time">{when}</span>}
                {badge}
              </div>
              {/* The ::after on this link covers the whole article, so the row
                  is one click target. The chips sit above it on z-index — they
                  are links of their own and must win. */}
              <a href={item.url ?? undefined} target="_blank" rel="noopener noreferrer" className="ui-news-link">
                <h3 className="ui-news-title">{item.title}</h3>
              </a>
              {item.summary && <p className="ui-news-sum">{item.summary}</p>}
              {(teams.length > 0 || players.length > 0) && (
                <div className="ui-news-chiprow">
                  {teams.map((t, ti) => (
                    <TeamLink
                      key={t.id ?? `t${ti}`}
                      teamId={t.id ?? null}
                      name={t.abbreviation || t.name}
                      size={12}
                      className="ui-news-chip"
                    />
                  ))}
                  {players.map((m) => (
                    <PlayerLink
                      key={m.id}
                      player={{ id: m.id, name: m.name }}
                      size={12}
                      photoSize={48}
                      stopPropagation
                      className="ui-news-chip"
                    />
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
