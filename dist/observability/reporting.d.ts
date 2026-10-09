import { type ReportContext, type Source } from "./event.js";
import { type Transport } from "./queue.js";
/**
 * The page's error reporter — one per page, started by initReporting().
 *
 * Unlike a component this does I/O (the push.ts exception): it posts to the
 * app's own POST /internal/errors, which forwards to the estate. Importing it
 * does nothing; every listener, patch and timer is installed by init, and
 * every call before init (or with enabled: false) is a no-op. Nothing in here
 * may throw into the host app: a reporter that crashes the page it reports on
 * is worse than none.
 */
export interface ReportingOptions {
    /** The app's display name, for this page's storage keys ("Football"). */
    app: string;
    /** Client build id (__BUILD_ID__ / version). */
    build?: string;
    /** Same-origin endpoint. Default "/internal/errors". */
    endpoint?: string;
    /** false = everything is a no-op. Typically import.meta.env.PROD. */
    enabled?: boolean;
    /** "client" (default) or "tv" for the TV kiosks. */
    source?: Source;
    /** Messages matching any of these are not reported. Added to the built-in noise list. */
    ignore?: RegExp[];
    /** Heartbeat for the session-died detector. Default true. */
    sessionDied?: boolean;
    /** console.error → warning (kind console), console.warn → breadcrumb. Default true. */
    console?: boolean;
    /** fetch + XMLHttpRequest → a breadcrumb each; 5xx and failures → warning (kind network). Default true. */
    network?: boolean;
    /** A same-origin <script> / stylesheet that fails to load → error (kind chunk). Default true. */
    resources?: boolean;
    /** For tests: replace fetch/sendBeacon. */
    transport?: Transport;
}
/** Report deliberately. Errors may be Error objects or messages; context is small key/values. */
export declare const report: {
    error: (errorOrMessage: unknown, context?: ReportContext) => void;
    warning: (message: unknown, context?: ReportContext) => void;
    info: (message: unknown, context?: ReportContext) => void;
};
/** A breadcrumb: what just happened, in a few words ("tap Fantasy"). Last 20 travel with each report. */
export declare function note(what: string): void;
/** Send anything queued now. `leaving` uses sendBeacon. */
export declare function flushReports(leaving?: boolean): void;
/** True once initReporting has run with enabled !== false. */
export declare function reportingActive(): boolean;
/**
 * Start reporting. Call once, first thing in main.tsx. Idempotent: a second
 * call (HMR) is ignored.
 */
export declare function initReporting(options: ReportingOptions): void;
/**
 * Reload once for new code; report it. False when the guard says a reload
 * already happened in the last 30s — then the error is real and the caller
 * shows / reports it.
 */
export declare function reloadForNewCode(kind: string, thrown?: unknown): boolean;
/** True when installChunkReload() has run on this page. */
export declare function chunkReloadInstalled(): boolean;
/**
 * Stale-chunk recovery: reload once (per 30 s) when a lazy route's chunk is
 * gone after a deploy. Listens for Vite's vite:preloadError; ErrorBoundary and
 * the global listeners also route stale-chunk errors here once installed.
 */
export declare function installChunkReload({ storageKey }?: {
    storageKey?: string;
}): void;
/**
 * Report a boot that never showed real UI: after `ms`, if ready() is still
 * false, report kind watchdog and call onStall. Waits for the page to be
 * visible first — a phone locked mid-boot is not a stall. Returns a cancel.
 */
export declare function installBootWatchdog({ ms, ready, onStall }: {
    ms?: number;
    ready: () => boolean;
    onStall?: () => void;
}): () => void;
/** For ErrorBoundary: report a caught render error, or reload when it is a stale chunk. */
export declare function reportBoundaryError(name: string, error: unknown, componentStack?: string | null): "reloading" | "reported";
/** Test hook: forget everything (listeners stay; tests run in node without a window). */
export declare function __resetForTests(): void;
