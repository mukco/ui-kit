import type { ReactNode } from "react";
import type { PlayerId } from "./config";
export interface NewsPlayerMention {
    id: PlayerId;
    name?: string | null;
    headshotUrl?: string | null;
}
export interface NewsTeamMention {
    id?: string | number | null;
    name?: string | null;
    abbreviation?: string | null;
    logoUrl?: string | null;
}
export interface NewsItem {
    id?: string | number;
    title?: string | null;
    url?: string | null;
    summary?: string | null;
    /** Display name of the outlet, used when `sources` has no entry for the key. */
    source?: string | null;
    /** Stable key into `sources` — "mlb", "espn", "reddit". */
    sourceKey?: string | null;
    publishedAt?: string | null;
    mentions?: NewsPlayerMention[] | null;
    teamMentions?: NewsTeamMention[] | null;
}
/** How one outlet is shown: its name, and the colour of its dot. */
export interface NewsSource {
    label?: string;
    /** Any CSS colour — `var(--chart-3)` keeps it on the app's palette. */
    color?: string;
}
export interface NewsPanelProps {
    items?: NewsItem[] | null;
    /** sourceKey → label and dot colour. Unknown keys fall back to `item.source`. */
    sources?: Record<string, NewsSource>;
    limit?: number;
    /** Panel heading. `null` renders the list bare, for a caller with its own. */
    title?: ReactNode;
    /**
     * A pill after the timestamp — baseball puts an injury there. The kit has no
     * business knowing what an item is flagged for, only where the flag goes.
     */
    renderBadge?: (item: NewsItem) => ReactNode;
    /** Fixed panel height; the list scrolls inside it. Absent → grows to fit. */
    height?: string | number;
    empty?: string;
    className?: string;
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
export declare function NewsPanel({ items, sources, limit, title, renderBadge, height, empty, className, }: NewsPanelProps): import("react").JSX.Element;
