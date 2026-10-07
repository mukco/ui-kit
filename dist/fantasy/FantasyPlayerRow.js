import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
const stop = (e) => e.stopPropagation();
export function FantasyPlayerRow({ lead, identity, trailing, actions, metrics, expandable = false, defaultExpanded = false, open: openProp, onOpenChange, children, className }) {
    const [ownOpen, setOwnOpen] = useState(defaultExpanded);
    const open = openProp ?? ownOpen;
    const toggle = () => {
        const next = !open;
        if (openProp === undefined)
            setOwnOpen(next);
        onOpenChange?.(next);
    };
    const caret = _jsx("span", { className: "ui-fprow-caret", "aria-hidden": "true", children: open ? "▲" : "▼" });
    return (_jsxs("div", { className: cn("ui-fprow", open && "ui-fprow--open", className), children: [_jsxs("div", { className: cn("ui-fprow-head", expandable && "ui-fprow-head--clickable"), onClick: expandable ? toggle : undefined, "aria-expanded": expandable ? open : undefined, children: [_jsxs("div", { className: "ui-fprow-id", children: [lead != null && _jsx("span", { className: "ui-fprow-lead", onClick: stop, children: lead }), _jsx("div", { className: "ui-fprow-who", children: identity }), trailing != null && _jsx("span", { className: "ui-fprow-trailing", onClick: stop, children: trailing }), expandable && _jsx("span", { className: "ui-fprow-caret-mobile", children: caret })] }), actions != null && _jsx("div", { className: "ui-fprow-actions", onClick: stop, children: actions }), (metrics != null || expandable) && (_jsx("div", { className: "ui-fprow-metrics", children: _jsxs("div", { className: "ui-fprow-metrics-inner", children: [metrics, expandable && _jsx("span", { className: "ui-fprow-caret-desktop", children: caret })] }) }))] }), open && children != null && _jsx("div", { className: "ui-fprow-body", children: children })] }));
}
