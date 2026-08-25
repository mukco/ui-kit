import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
/** Card whose body folds away behind a header row — the expandable cards
    used across player and team pages. Controlled or self-contained. */
export function ExpandableCard({ title, subtitle, open, onToggle, children, className }) {
    const [innerOpen, setInnerOpen] = useState(false);
    const isOpen = open ?? innerOpen;
    function toggle() {
        onToggle?.(!isOpen);
        if (open == null)
            setInnerOpen((v) => !v);
    }
    return (_jsxs("div", { className: cn("ui-card ui-expandable", className), children: [_jsxs("button", { type: "button", className: "ui-expandable-head", onClick: toggle, "aria-expanded": isOpen, children: [_jsxs("span", { className: "ui-expandable-titles", children: [_jsx("span", { className: "ui-expandable-title", children: title }), subtitle && _jsx("span", { className: "ui-expandable-sub", children: subtitle })] }), _jsx("span", { className: cn("ui-expandable-chevron", isOpen && "ui-expandable-chevron--open"), "aria-hidden": "true", children: "\u25BE" })] }), isOpen && _jsx("div", { className: "ui-expandable-body", children: children })] }));
}
