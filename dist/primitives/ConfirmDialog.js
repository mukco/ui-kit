import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { cn } from "../cn";
import { useFocusTrap } from "./useFocusTrap";
/**
 * Are you sure, for the things that cannot be taken back.
 *
 * The kit had no confirmation primitive at all, in an estate whose panel
 * reboots containers and runs SQL — so each consuming app either invented its
 * own or, more often, did the irreversible thing on a single click. That is
 * the divergence a shared kit exists to prevent, and it is the case where
 * divergence costs the most.
 *
 * Cancel is focused first, not confirm. Someone who opened this by accident
 * should be one Return away from nothing happening, and Escape does the same.
 * The dangerous button is never the default.
 */
export function ConfirmDialog({ open, title, children, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, busy, onConfirm, onCancel, className, }) {
    const panel = useRef(null);
    useFocusTrap(open, panel, onCancel);
    if (!open)
        return null;
    return (_jsx("div", { className: "ui-confirm-overlay", onClick: onCancel, children: _jsxs("div", { ref: panel, role: "alertdialog", "aria-modal": "true", "aria-label": title, tabIndex: -1, className: cn("ui-confirm", className), onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { className: "ui-confirm-title", children: title }), children && _jsx("div", { className: "ui-confirm-body", children: children }), _jsxs("div", { className: "ui-confirm-actions", children: [_jsx("button", { type: "button", className: "ui-confirm-cancel", onClick: onCancel, disabled: busy, children: cancelLabel }), _jsx("button", { type: "button", className: cn("ui-confirm-go", destructive && "ui-confirm-go--danger"), onClick: onConfirm, disabled: busy, children: busy ? "Working…" : confirmLabel })] })] }) }));
}
