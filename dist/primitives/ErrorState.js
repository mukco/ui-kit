import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { cn } from "../cn";
import { IconAlert } from "./Icon";
import { busyLine, couldNotLoad } from "./errorCopy";
export { busyLine, couldNotLoad };
/**
 * Seconds left of a Retry-After, ticking once a second down to 0. Pass the
 * error (or anything that changes per failure) as `key` so a second 429 asking
 * for the same wait starts again.
 */
export function useRetryCountdown(seconds, key) {
    const total = seconds && seconds > 0 ? Math.ceil(seconds) : 0;
    const [left, setLeft] = useState(total);
    useEffect(() => {
        setLeft(total);
        if (!total)
            return;
        const end = Date.now() + total * 1000;
        const timer = setInterval(() => {
            const n = Math.max(0, Math.ceil((end - Date.now()) / 1000));
            setLeft(n);
            if (n === 0)
                clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [total, key]);
    return left;
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
export function ErrorState({ children, what, detail, onRetry, retryLabel = "Try again", retryAfter, retryKey, icon, compact = false, className, }) {
    const wait = useRetryCountdown(retryAfter, retryKey);
    const message = children ?? couldNotLoad(what ?? "this");
    const shownDetail = wait > 0 ? busyLine(wait) : detail;
    return (_jsxs("div", { className: cn("ui-error", compact && "ui-errorstate--compact", className), role: "alert", children: [_jsx("span", { className: "ui-error-icon", "aria-hidden": "true", children: icon ?? _jsx(IconAlert, { size: compact ? 16 : 24 }) }), _jsx("span", { className: "ui-error-msg", children: message }), shownDetail != null && (_jsx("code", { className: "ui-error-detail", "aria-live": wait > 0 ? "off" : undefined, "aria-label": wait > 0 ? "Busy, try again shortly" : undefined, children: shownDetail })), onRetry && wait === 0 && (_jsx("button", { type: "button", className: "ui-error-retry", onClick: onRetry, children: retryLabel }))] }));
}
