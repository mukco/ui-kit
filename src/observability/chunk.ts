import type { StorageLike } from "./session.js"

/**
 * A chunk that 404s is not a bug, it is a stale page: a phone holding an
 * index.html whose chunk hashes a later deploy replaced. The remedy is to
 * fetch the new shell — once. Football's AppErrorBoundary and Family Hub's
 * main.tsx each learned the messages browsers use for it; this is both lists.
 */
export const STALE_CHUNK =
  /Loading (CSS )?chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|ChunkLoadError|Importing a module script failed|Unable to preload CSS/i

export function isStaleChunk(error: unknown): boolean {
  try {
    const e = error as { name?: unknown; message?: unknown } | null | undefined
    const text = typeof error === "string" ? error : `${e?.name ?? ""} ${e?.message ?? ""}`
    return STALE_CHUNK.test(text)
  } catch {
    return false
  }
}

/** A reload is allowed at most once inside this window. */
export const RELOAD_WINDOW_MS = 30_000

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
export function claimReload(storage: StorageLike | null | undefined, key: string, now = Date.now(), windowMs = RELOAD_WINDOW_MS): boolean {
  try {
    if (!storage) return true
    const last = Number(storage.getItem(key) || 0)
    if (Number.isFinite(last) && now - last >= 0 && now - last < windowMs) return false
    storage.setItem(key, String(now))
    return true
  } catch {
    return true
  }
}
