import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { cn } from "../cn";
/** Off-canvas panel sliding over the page from either edge, with overlay. */
export function Drawer({ open, onClose, side = "right", label, children }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);
    if (!open)
        return null;
    return (_jsx("div", { className: "ui-drawer-overlay", onClick: onClose, children: _jsx("aside", { role: "dialog", "aria-modal": "true", "aria-label": label, className: cn("ui-drawer", `ui-drawer--${side}`), onClick: (e) => e.stopPropagation(), children: children }) }));
}
