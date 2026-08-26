import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
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
export function ErrorState({ children, detail, onRetry, retryLabel = "Try again", icon = "⚠", className, }) {
    return (_jsxs("div", { className: cn("ui-error", className), role: "alert", children: [_jsx("span", { className: "ui-error-icon", "aria-hidden": "true", children: icon }), _jsx("span", { className: "ui-error-msg", children: children }), detail != null && _jsx("code", { className: "ui-error-detail", children: detail }), onRetry && (_jsx("button", { type: "button", className: "ui-error-retry", onClick: onRetry, children: retryLabel }))] }));
}
