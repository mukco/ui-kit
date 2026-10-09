/**
 * Did the last session die in front of someone?
 *
 * A page that is killed while on screen — iOS reclaiming a WebKit process
 * mid-gesture, a renderer crash, a tab frozen until the OS shoots it — runs no
 * code on its way out, so nothing can report it at the time. What it can do is
 * leave a mark while alive: a heartbeat in localStorage every few seconds
 * while visible, cleared to "clean" on pagehide and whenever the page is
 * hidden. The next launch reads the mark: still "live" means the last session
 * ended while visible without a pagehide, i.e. it died.
 *
 * Hidden counts as clean on purpose. The OS killing a backgrounded app is
 * normal and not anyone's bug; only a death on screen is.
 *
 * Pure apart from the Storage it is handed, so tests run it on a fake.
 */
export interface SessionMark {
    id: string;
    /** Last heartbeat, epoch ms. */
    beat: number;
    started: number;
    clean: boolean;
    route?: string;
    breadcrumbs?: string[];
    build?: string;
}
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export declare const HEARTBEAT_MS = 5000;
/** A mark older than this is from a session too long ago to be worth a report. */
export declare const RECENT_MS: number;
export declare function readMark(storage: StorageLike | null | undefined, key: string): SessionMark | null;
export declare function writeMark(storage: StorageLike | null | undefined, key: string, mark: SessionMark): void;
/** The previous session, when it died on screen recently enough to report. */
export declare function diedLastTime(prev: SessionMark | null, now: number, recentMs?: number): SessionMark | null;
export interface SessionTracker {
    /** The previous session if it died on screen; read once, at start. */
    died: SessionMark | null;
    beat(route?: string, breadcrumbs?: string[]): void;
    clean(): void;
    live(): void;
}
/**
 * Read the previous mark, then start this session's. The caller drives the
 * rest from page events: beat() on a timer while visible and on route
 * changes, clean() on pagehide / hidden, live() on visible.
 */
export declare function startSession(storage: StorageLike | null | undefined, key: string, { id, now, build }: {
    id: string;
    now?: () => number;
    build?: string;
}): SessionTracker;
