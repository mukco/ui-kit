/** The tabs shown for a count: the first `count`, the current one swapped into the last slot if it was past them. */
export function shownTabs(total, count, here) {
    const shown = Array.from({ length: Math.min(count, total) }, (_, i) => i);
    if (here >= count && count > 0 && here < total)
        shown[shown.length - 1] = here;
    return shown;
}
/** The width each of `slots` equal slots gets. */
export function slotWidth(room, gap, slots) {
    return slots > 0 ? (room - gap * (slots - 1)) / slots : room;
}
/**
 * How many tabs to show (the rest go under More). Never fewer than one: on a
 * screen too narrow for even one tab and More at 44px each, that one is shown
 * below the floor rather than no tab at all.
 */
export function fitTabs({ widths, moreWidth, room, gap, here, alwaysMore, minSlot = 44 }) {
    const n = widths.length;
    if (n === 0 || room <= 0)
        return n;
    for (let k = n; k >= 1; k--) {
        const more = alwaysMore || k < n;
        const slot = slotWidth(room, gap, k + (more ? 1 : 0));
        if (slot < minSlot)
            continue;
        if (more && moreWidth > slot)
            continue;
        if (shownTabs(n, k, here).every((i) => widths[i] <= slot))
            return k;
    }
    return 1;
}
const under = (pathname, m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`));
/**
 * More's sheet, in sections: the tabs that did not fit first, under one
 * heading, then the app's own items in runs of the same group (a run with no
 * group has no heading, and is still a section of its own, so it never reads
 * as part of the run above). An item whose path is also a tab is dropped:
 * that tab is in the bar or already at the top.
 */
export function moreSections(overflow, items, allTabs, pathname, heading) {
    const out = [];
    if (overflow.length) {
        out.push({ heading, entries: overflow.map((t) => ({ to: t.to, label: t.label, here: t.match.some((m) => under(pathname, m)) })) });
    }
    let run = null;
    for (const i of items) {
        if (allTabs.some((t) => t.to === i.to))
            continue;
        const group = i.group || undefined;
        if (!run || run.heading !== group) {
            run = { heading: group, entries: [] };
            out.push(run);
        }
        run.entries.push({ to: i.to, label: i.label, here: under(pathname, i.to) });
    }
    return out;
}
