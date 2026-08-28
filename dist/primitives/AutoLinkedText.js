import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment, useEffect, useMemo, useState } from "react";
import { sportsIdentity } from "../sports/config";
import { PlayerLink } from "../sports/PlayerLink";
import { extractCandidates, matchKey } from "../sports/playerNames";
import { cn } from "../cn";
const NUM_SPLIT = /(\b\d+\.?\d*%?|\.\d+\b)/g;
function renderWithNumbers(text, keyPrefix) {
    return text.split(NUM_SPLIT).map((part, i) => /^\d/.test(part) || part.startsWith(".")
        ? _jsx("strong", { children: part }, `${keyPrefix}-n${i}`)
        : part);
}
/** AI-prose renderer: bolds numbers and turns known player/team names into
    links. Pass `players` (the entities already in scope) for deterministic
    linking; without it, only `links` apply. */
export function AutoLinkedText({ text, players = null, renderPlayerLink, playerHref, wrapPlayer, links = [], className, resolveFromProse = false, }) {
    const identity = sportsIdentity();
    const [proseIds, setProseIds] = useState({});
    // Open mode. Only runs when there is no known set to link by membership in.
    // Prose extraction runs even when a known set was passed. It used to be
    // skipped entirely if `players` was an array, so a panel that supplied a
    // roster linked only the names on that roster and silently dropped every
    // other player in the sentence — and an empty roster (not loaded yet) linked
    // nothing at all. One app passed a set and the other did not, which is why
    // the same sentence showed linked players in one and plain text in the other.
    const candidates = useMemo(() => (resolveFromProse ? extractCandidates(text) : []), [resolveFromProse, text]);
    useEffect(() => {
        if (!candidates.length || !identity.resolvePlayer)
            return;
        let alive = true;
        Promise.all(candidates.map((name) => identity
            .resolvePlayer(name)
            .then((hit) => hit?.id != null && matchKey(hit.name ?? name) === matchKey(name)
            ? [name, hit.id]
            : null)
            .catch(() => null))).then((pairs) => {
            if (!alive)
                return;
            const map = {};
            for (const pair of pairs)
                if (pair)
                    map[pair[0]] = pair[1];
            setProseIds(map);
        });
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidates.join("|")]);
    const nameToId = useMemo(() => {
        // Not gated on renderPlayerLink any more: a resolved player links whether
        // or not the caller brought its own renderer.
        if (!players)
            return proseIds;
        // Membership in the known set is authoritative — it is the one form of
        // linking that cannot be wrong — but it layers ON TOP of what prose
        // resolution found rather than replacing it. Longest-name-first so
        // "Mike Johnson" wins over "Johnson".
        const map = { ...proseIds };
        for (const p of [...players].sort((a, b) => b.name.length - a.name.length)) {
            if (text.includes(p.name))
                map[p.name] = p.id;
        }
        return map;
    }, [players, text, proseIds]);
    const linkMap = useMemo(() => {
        const map = {};
        links.forEach((l) => {
            if (l.name && (l.onClick || l.href))
                map[l.name] = l;
        });
        return map;
    }, [links]);
    const parts = useMemo(() => {
        if (!text)
            return [];
        const allLinked = [...Object.keys(nameToId), ...Object.keys(linkMap)];
        if (!allLinked.length)
            return [text];
        const escaped = [...allLinked]
            .sort((a, b) => b.length - a.length)
            .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        return text.split(new RegExp(`(${escaped.join("|")})`, "g"));
    }, [text, nameToId, linkMap]);
    return (_jsx("span", { className: cn(className), children: parts.map((part, i) => {
            const playerId = nameToId[part];
            if (playerId != null) {
                if (renderPlayerLink) {
                    return _jsx(Fragment, { children: renderPlayerLink(part, playerId) }, `pl-${i}`);
                }
                // One rendering of a player named in AI prose, for every app: the
                // headshot, the name, the app's own router link.
                return (_jsx(PlayerLink, { player: { id: playerId, name: part }, size: 16, photoSize: 48, stopPropagation: true, className: "ui-autolink-player", href: playerHref ? playerHref(playerId) : undefined, wrap: wrapPlayer }, `pl-${i}`));
            }
            const named = linkMap[part];
            if (named?.href) {
                return (_jsx("a", { href: named.href, className: "ui-autolink", children: part }, `ln-${i}`));
            }
            if (named?.onClick) {
                return (_jsx("button", { type: "button", onClick: named.onClick, className: "ui-autolink", children: part }, `lb-${i}`));
            }
            return _jsx(Fragment, { children: renderWithNumbers(part, String(i)) }, `p-${i}`);
        }) }));
}
