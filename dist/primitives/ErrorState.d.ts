import type { ReactNode } from "react";
interface Props {
    /** What went wrong, in a sentence. */
    children: ReactNode;
    /** Shown under the message in a monospace block — a status line, an
        exception class. Omit it rather than inventing one. */
    detail?: ReactNode;
    /** When given, a Try again button appears and calls this. */
    onRetry?: () => void;
    retryLabel?: string;
    icon?: ReactNode;
    className?: string;
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
 * role="alert" because a failure that appears after the page has settled is
 * exactly the case a screen reader user cannot see happen.
 */
export declare function ErrorState({ children, detail, onRetry, retryLabel, icon, className, }: Props): import("react").JSX.Element;
export {};
