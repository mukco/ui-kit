/** Day/month label helpers so the kit needs no date library. */
export function parseDay(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}
/** "Aug 24" */
export function fmtDay(iso) {
    const d = parseDay(iso);
    if (!d)
        return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
/** "8/24" */
export function fmtShortDay(iso) {
    const d = parseDay(iso);
    if (!d)
        return "";
    return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}
