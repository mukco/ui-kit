import { type ReactNode } from "react";
import { busyLine, couldNotLoad } from "./errorCopy";
interface Props {
    /**
     * What went wrong, in a sentence. Most failures are a read that did not
     * come back: pass `what` instead and the kit says it the one way every app
     * says it ("Couldn't load news."). Children win when both are given.
     */
    children?: ReactNode;
    /** The thing that failed to load, lower case: "news", "the schedule". */
    what?: string;
    /** Shown under the message in a monospace block — a status line, an
        exception class. Omit it rather than inventing one. */
    detail?: ReactNode;
    /** When given, a Try again button appears and calls this. */
    onRetry?: () => void;
    retryLabel?: string;
    /**
     * Seconds the server asked us to wait (a 429's Retry-After). While it runs
     * down the detail line counts it and Try again is held back — tapping sooner
     * would only be refused again — then the button comes back.
     */
    retryAfter?: number | null;
    /** Restarts the countdown when it changes — the error object itself, say, so
        a second 429 asking for the same number of seconds starts again. */
    retryKey?: unknown;
    icon?: ReactNode;
    /**
     * Tight variant for a container that cannot give up 2.5rem — a fixed-height
     * popover, a table cell, an inline row. Without it an app with nowhere to put
     * the full block hand-rolls a small one instead, which is exactly how these
     * states diverged between apps.
     */
    compact?: boolean;
    className?: string;
}
export { busyLine, couldNotLoad };
/**
 * Seconds left of a Retry-After, ticking once a second down to 0. Pass the
 * error (or anything that changes per failure) as `key` so a second 429 asking
 * for the same wait starts again.
 */
export declare function useRetryCountdown(seconds: number | null | undefined, key?: unknown): number;
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
export declare function ErrorState({ children, what, detail, onRetry, retryLabel, retryAfter, retryKey, icon, compact, className, }: Props): import("react").JSX.Element;
