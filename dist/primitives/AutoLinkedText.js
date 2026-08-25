import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment, useMemo } from "react";
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
export function AutoLinkedText({ text, players = null, renderPlayerLink, links = [], className }) {
    const nameToId = useMemo(() => {
        if (!players || !renderPlayerLink)
            return {};
        // Link by membership in the known set, longest-name-first so "Mike Johnson"
        // wins over "Johnson".
        const map = {};
        for (const p of [...players].sort((a, b) => b.name.length - a.name.length)) {
            if (text.includes(p.name))
                map[p.name] = p.id;
        }
        return map;
    }, [players, text, renderPlayerLink]);
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
            if (playerId != null && renderPlayerLink) {
                return _jsx(Fragment, { children: renderPlayerLink(part, playerId) }, `pl-${i}`);
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
