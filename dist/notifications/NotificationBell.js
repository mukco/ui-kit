import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";
/** Bell with unread badge opening a dropdown list. Items and dismissal are
    the app's business; the kit draws the affordance. */
export function NotificationBell({ items, onItemClick, onDismissAll, empty = "You're all caught up.", className }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    useEffect(() => {
        const onDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);
    return (_jsxs("div", { ref: rootRef, className: cn("ui-bell", className), children: [_jsxs("button", { type: "button", className: "ui-bell-btn", "aria-label": "Notifications", "aria-expanded": open, onClick: () => setOpen((v) => !v), children: [_jsxs("svg", { className: "ui-bell-icon", viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" }), _jsx("path", { d: "M13.7 20a1.9 1.9 0 0 1-3.4 0" })] }), items.length > 0 && _jsx("span", { className: "ui-bell-badge", children: items.length > 9 ? "9+" : items.length })] }), open && (_jsxs("div", { className: "ui-bell-panel", children: [_jsxs("div", { className: "ui-bell-head", children: [_jsx("p", { className: "ui-bell-head-title", children: "Notifications" }), onDismissAll && items.length > 0 && (_jsx("button", { type: "button", className: "ui-bell-clear", onClick: onDismissAll, children: "Clear all" }))] }), items.length === 0 ? (_jsx("p", { className: "ui-bell-empty", children: empty })) : (items.map((n) => (_jsxs("button", { type: "button", className: "ui-bell-item", onClick: () => onItemClick?.(n), children: [_jsx("span", { className: cn(items.length > 0 && "ui-bell-dot"), style: { background: undefined }, "aria-hidden": "true" }), n.icon && _jsx("span", { className: "ui-bell-item-icon", children: n.icon }), _jsxs("span", { className: "ui-bell-item-body", children: [_jsx("span", { className: "ui-bell-item-title", children: n.title }), n.body && _jsx("span", { className: "ui-bell-item-body-text", children: n.body }), n.time && _jsx("span", { className: "ui-bell-item-time", children: n.time })] })] }, n.id))))] }))] }));
}
