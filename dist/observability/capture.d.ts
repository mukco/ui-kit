import type { Level, ReportContext } from "./event.js";
/**
 * Rollbar-style capture beyond crashes: console.error, console.warn and the
 * network. Each piece takes what it wraps as an argument (a console, a fetch,
 * an XMLHttpRequest class) and the reporter's hooks, so the node tests drive
 * them with fakes; reporting.ts installs them on the real page at init.
 */
export interface CaptureHooks {
    report: (level: Level, thrown: unknown, context: ReportContext) => void;
    note: (what: string) => void;
    /** This exact Error object was already reported (by a boundary or onerror). */
    alreadyReported: (thrown: unknown) => boolean;
    /** A request to the reporting endpoint itself — never captured. */
    isOwn: (url: string) => boolean;
    /** Run soon, after the current task — lets a boundary report first. */
    defer: (fn: () => void) => void;
    now: () => number;
    /** Offline or hidden: network failures then are the device's, not a bug. */
    quiet: () => boolean;
    /** The page URL, to resolve relative request URLs against. */
    base: () => string;
}
/** At most this many console / network reports per page session (each). */
export declare const CAPTURE_CAP = 50;
/** console's own format: "%s", "%o", "%c" … substituted the way the console would. */
export declare function formatConsoleArgs(args: unknown[]): string;
/**
 * console.error → a warning (kind: console); console.warn → a breadcrumb.
 * The original method always runs, first. Returns an uninstall.
 */
export declare function captureConsole(target: Pick<Console, "error" | "warn">, hooks: CaptureHooks): () => void;
/** Path only — never the query string, which can carry keys. Other origins keep their host. */
export declare function requestPath(url: string, base: string): string;
/** A fetch that leaves a breadcrumb per request and reports 5xx and failures. Same promise back, untouched. */
export declare function wrapFetch(original: typeof fetch, hooks: CaptureHooks): typeof fetch;
/** XMLHttpRequest: the same breadcrumbs and reports, via open/send. */
export declare function captureXhr(Xhr: {
    prototype: XMLHttpRequest;
}, hooks: CaptureHooks): () => void;
