import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { age } from "../lib/age";
import { SectionLabel } from "../primitives/SectionLabel";
import { PlayerLink } from "./PlayerLink";
import { TeamLink } from "./TeamLink";
function SourceTag({ item, sources }) {
    const meta = (item.sourceKey && sources?.[item.sourceKey]) || null;
    const label = meta?.label ?? item.source;
    if (!label)
        return null;
    // The colour rides an inline custom property rather than a modifier class, so
    // an app adds an outlet by adding a row to its `sources` map — not a rule to
    // its stylesheet and a branch to a component.
    return (_jsxs("span", { className: "ui-news-src", style: meta?.color ? { "--ui-news-src": meta.color } : undefined, children: [_jsx("span", { className: "ui-news-dot" }), _jsx("span", { className: "ui-news-srcname", children: label })] }));
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
export function NewsPanel({ items, sources, limit, title = "Team News", renderBadge, height, empty = "No news available", className, }) {
    const rows = (items ?? []).slice(0, limit ?? undefined);
    return (_jsxs("div", { className: cn("ui-card ui-news-panel", className), style: height != null ? { height } : undefined, children: [title != null && _jsx(SectionLabel, { children: title }), _jsxs("div", { className: "ui-news-scroll", children: [rows.length === 0 && _jsx("p", { className: "ui-news-empty", children: empty }), rows.map((item, i) => {
                        const teams = (item.teamMentions ?? []).filter((t) => t.abbreviation || t.name).slice(0, 3);
                        const players = (item.mentions ?? []).filter((m) => m.id != null).slice(0, 4);
                        const when = age(item.publishedAt);
                        const badge = renderBadge?.(item);
                        return (_jsxs("article", { className: "ui-news-item", children: [_jsxs("div", { className: "ui-news-meta", children: [_jsx(SourceTag, { item: item, sources: sources }), when && _jsx("span", { className: "ui-news-time", children: when }), badge] }), _jsx("a", { href: item.url ?? undefined, target: "_blank", rel: "noopener noreferrer", className: "ui-news-link", children: _jsx("h3", { className: "ui-news-title", children: item.title }) }), item.summary && _jsx("p", { className: "ui-news-sum", children: item.summary }), (teams.length > 0 || players.length > 0) && (_jsxs("div", { className: "ui-news-chiprow", children: [teams.map((t, ti) => (_jsx(TeamLink, { teamId: t.id ?? null, name: t.abbreviation || t.name, size: 12, className: "ui-news-chip" }, t.id ?? `t${ti}`))), players.map((m) => (_jsx(PlayerLink, { player: { id: m.id, name: m.name }, size: 12, photoSize: 48, stopPropagation: true, className: "ui-news-chip" }, m.id)))] }))] }, item.id ?? i));
                    })] })] }));
}
