export const HEARTBEAT_MS = 5_000;
/** A mark older than this is from a session too long ago to be worth a report. */
export const RECENT_MS = 6 * 60 * 60 * 1000;
export function readMark(storage, key) {
    try {
        const raw = storage?.getItem(key);
        if (!raw)
            return null;
        const m = JSON.parse(raw);
        return m && typeof m.beat === "number" && typeof m.clean === "boolean" ? m : null;
    }
    catch {
        return null;
    }
}
export function writeMark(storage, key, mark) {
    try {
        storage?.setItem(key, JSON.stringify(mark));
    }
    catch { /* full or refused */ }
}
/** The previous session, when it died on screen recently enough to report. */
export function diedLastTime(prev, now, recentMs = RECENT_MS) {
    if (!prev || prev.clean)
        return null;
    if (now - prev.beat > recentMs || now < prev.beat - 60_000)
        return null;
    return prev;
}
/**
 * Read the previous mark, then start this session's. The caller drives the
 * rest from page events: beat() on a timer while visible and on route
 * changes, clean() on pagehide / hidden, live() on visible.
 */
export function startSession(storage, key, { id, now = Date.now, build }) {
    const died = diedLastTime(readMark(storage, key), now());
    const started = now();
    let mark = { id, beat: started, started, clean: false, build };
    writeMark(storage, key, mark);
    return {
        died,
        beat(route, breadcrumbs) {
            mark = { ...mark, beat: now(), clean: false, ...(route !== undefined && { route }), ...(breadcrumbs && { breadcrumbs: breadcrumbs.slice(-20) }) };
            writeMark(storage, key, mark);
        },
        clean() {
            mark = { ...mark, beat: now(), clean: true };
            writeMark(storage, key, mark);
        },
        live() {
            mark = { ...mark, beat: now(), clean: false };
            writeMark(storage, key, mark);
        },
    };
}
