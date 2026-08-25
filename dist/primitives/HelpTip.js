import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
/** A small "?" that reveals help text on hover or keyboard focus. */
export function HelpTip({ children }) {
    const [open, setOpen] = useState(false);
    return (_jsxs("span", { className: "ui-helptip", children: [_jsx("button", { type: "button", "aria-label": "Help", className: "ui-helptip-btn", onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false), onFocus: () => setOpen(true), onBlur: () => setOpen(false), onClick: () => setOpen((v) => !v), children: "?" }), (open || undefined) && _jsx("span", { className: "ui-helptip-bubble", children: children })] }));
}
