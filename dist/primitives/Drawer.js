import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import { cn } from "../cn";
import { useFocusTrap } from "./useFocusTrap";
/**
 * Off-canvas panel sliding over the page from either edge.
 *
 * It used to declare `role="dialog" aria-modal="true"` and implement none of
 * it: Tab walked out into the page behind, nothing took focus on open, closing
 * dropped focus on <body>, and the background kept scrolling. The ARIA told
 * assistive tech the rest of the page was inert while the browser disagreed.
 */
export function Drawer({ open, onClose, side = "right", label, children }) {
    const panel = useRef(null);
    useFocusTrap(open, panel, onClose);
    if (!open)
        return null;
    return (_jsx("div", { className: "ui-drawer-overlay", onClick: onClose, children: _jsx("aside", { ref: panel, role: "dialog", "aria-modal": "true", "aria-label": label, tabIndex: -1, className: cn("ui-drawer", `ui-drawer--${side}`), onClick: (e) => e.stopPropagation(), children: children }) }));
}
