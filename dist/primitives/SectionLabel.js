import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** Small-caps label row for a sub-section inside a card, with an optional
    right-aligned control. Not PageHeader — this is for the divisions inside
    a card, not the page itself. */
export function SectionLabel({ children, action, className }) {
    return (_jsxs("div", { className: cn("ui-sectionlabel", className), children: [_jsx("span", { className: "ui-sectionlabel-text", children: children }), action] }));
}
