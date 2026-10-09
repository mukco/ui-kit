import type { StorageLike } from "./session.js";
/**
 * A chunk that 404s is not a bug, it is a stale page: a phone holding an
 * index.html whose chunk hashes a later deploy replaced. The remedy is to
 * fetch the new shell — once. Football's AppErrorBoundary and Family Hub's
 * main.tsx each learned the messages browsers use for it; this is both lists.
 */
export declare const STALE_CHUNK: RegExp;
export declare function isStaleChunk(error: unknown): boolean;
/** A reload is allowed at most once inside this window. */
export declare const RELOAD_WINDOW_MS = 30000;
/**
 * May this page reload for new code now? Claims the slot when it may.
 *
 * A timestamp, not a boolean, and in sessionStorage, not memory (football,
 * measured): a boundary mounts successfully before the lazy chunk rejects, so
 * any "clear the flag once we render" logic clears it moments before the
 * error arrives and the reload loops — 55 navigations in 9 seconds. A
 * timestamp needs no clearing: a genuinely stale page reloads once, a page
 * broken for another reason stops and says so, and a later visit outside the
 * window may try again.
 *
 * Storage refused (private mode): allow it. Better to reload once too often
 * than to strand someone on an error page they cannot clear.
 */
export declare function claimReload(storage: StorageLike | null | undefined, key: string, now?: number, windowMs?: number): boolean;
