import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";
/**
 * One key that says how a list is ordered and opens the choices — in place of
 * a row of chips per option. Football's waiver wire had nine sort chips
 * wrapping onto two lines under the position chips (2026-10-08); this is one
 * line, and the list it opens is the app's own, themed, not the phone's.
 */
export function SortMenu({ options, active, onChange, label = "Sort", className }) {
    const [open, setOpen] = useState(false);
    const root = useRef(null);
    const current = options.find((o) => o.id === active) ?? options[0];
    useEffect(() => {
        if (!open)
            return undefined;
        const away = (e) => { if (!root.current?.contains(e.target))
            setOpen(false); };
        const key = (e) => { if (e.key === "Escape")
            setOpen(false); };
        document.addEventListener("mousedown", away);
        document.addEventListener("touchstart", away);
        document.addEventListener("keydown", key);
        return () => {
            document.removeEventListener("mousedown", away);
            document.removeEventListener("touchstart", away);
            document.removeEventListener("keydown", key);
        };
    }, [open]);
    return (_jsxs("div", { ref: root, className: cn("ui-sortmenu", className), children: [_jsxs("button", { type: "button", className: "ui-sortmenu-btn", "aria-haspopup": "listbox", "aria-expanded": open, onClick: () => setOpen((v) => !v), children: [_jsx("span", { className: "ui-sortmenu-label", children: label }), _jsx("span", { className: "ui-sortmenu-value", children: current?.label }), _jsx("svg", { viewBox: "0 0 24 24", width: "14", height: "14", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": "true", children: _jsx("path", { d: "M6 9l6 6 6-6", strokeLinecap: "round", strokeLinejoin: "round" }) })] }), open && (_jsx("ul", { className: "ui-sortmenu-list", role: "listbox", "aria-label": label, children: options.map((o) => (_jsx("li", { children: _jsx("button", { type: "button", role: "option", "aria-selected": o.id === active, className: cn("ui-sortmenu-opt", o.id === active && "is-on"), onClick: () => { onChange(o.id); setOpen(false); }, children: o.label }) }, o.id))) }))] }));
}
