import { useEffect, useState, type ReactNode } from "react"
import { cn } from "../cn"
import { IconAlert } from "./Icon"

interface Props {
  /**
   * What went wrong, in a sentence. Most failures are a read that did not
   * come back: pass `what` instead and the kit says it the one way every app
   * says it ("Couldn't load news."). Children win when both are given.
   */
  children?: ReactNode
  /** The thing that failed to load, lower case: "news", "the schedule". */
  what?: string
  /** Shown under the message in a monospace block — a status line, an
      exception class. Omit it rather than inventing one. */
  detail?: ReactNode
  /** When given, a Try again button appears and calls this. */
  onRetry?: () => void
  retryLabel?: string
  /**
   * Seconds the server asked us to wait (a 429's Retry-After). While it runs
   * down the detail line counts it and Try again is held back — tapping sooner
   * would only be refused again — then the button comes back.
   */
  retryAfter?: number | null
  /** Restarts the countdown when it changes — the error object itself, say, so
      a second 429 asking for the same number of seconds starts again. */
  retryKey?: unknown
  icon?: ReactNode
  /**
   * Tight variant for a container that cannot give up 2.5rem — a fixed-height
   * popover, a table cell, an inline row. Without it an app with nowhere to put
   * the full block hand-rolls a small one instead, which is exactly how these
   * states diverged between apps.
   */
  compact?: boolean
  className?: string
}

/** The one phrasing for a read that failed. */
export const couldNotLoad = (what: string) => `Couldn't load ${what}.`

/** The line a held-back retry shows while it counts down. */
export const busyLine = (seconds: number) => `Busy · try again in ${seconds}s`

/**
 * Seconds left of a Retry-After, ticking once a second down to 0. Pass the
 * error (or anything that changes per failure) as `key` so a second 429 asking
 * for the same wait starts again.
 */
export function useRetryCountdown(seconds: number | null | undefined, key?: unknown): number {
  const total = seconds && seconds > 0 ? Math.ceil(seconds) : 0
  const [left, setLeft] = useState(total)
  useEffect(() => {
    setLeft(total)
    if (!total) return
    const end = Date.now() + total * 1000
    const timer = setInterval(() => {
      const n = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setLeft(n)
      if (n === 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [total, key])
  return left
}

/**
 * Something failed, as distinct from something being empty.
 *
 * The kit had one "nothing here" primitive and used it for both, so a table
 * whose fetch had failed and a table with genuinely no rows rendered the same
 * icon and the same grey sentence. Those need opposite reactions — one is
 * fine and one needs someone to do something — and the consuming apps were
 * each inventing their own way to tell them apart, which is the divergence a
 * shared kit exists to prevent.
 *
 * Deliberately the same shape as EmptyState so swapping one for the other is
 * a one-word change: same centred block, same icon slot, message as children.
 * What it adds is the part an empty state must never have — a way out.
 *
 * The icon is the kit's line alert, not an emoji: a "⚠" drew in whatever
 * colour and style the phone's emoji font chose, beside monochrome glyphs.
 *
 * role="alert" because a failure that appears after the page has settled is
 * exactly the case a screen reader user cannot see happen.
 */
export function ErrorState({
  children,
  what,
  detail,
  onRetry,
  retryLabel = "Try again",
  retryAfter,
  retryKey,
  icon,
  compact = false,
  className,
}: Props) {
  const wait = useRetryCountdown(retryAfter, retryKey)
  const message = children ?? couldNotLoad(what ?? "this")
  const shownDetail = wait > 0 ? busyLine(wait) : detail
  return (
    <div className={cn("ui-error", compact && "ui-errorstate--compact", className)} role="alert">
      <span className="ui-error-icon" aria-hidden="true">
        {icon ?? <IconAlert size={compact ? 16 : 24} />}
      </span>
      <span className="ui-error-msg">{message}</span>
      {shownDetail != null && <code className="ui-error-detail">{shownDetail}</code>}
      {onRetry && wait === 0 && (
        <button type="button" className="ui-error-retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}
