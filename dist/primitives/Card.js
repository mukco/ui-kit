import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
/** The kit's basic surface: bordered, rounded, subtly elevated. */
export function Card({ children, className, title, subtitle, help, actions, headBar }) {
    return (_jsxs("section", { className: cn("ui-card", headBar && "ui-card--barred", className), children: [(title || actions) && (_jsxs("div", { className: cn("ui-card-head", headBar && "ui-card-head--bar", headBar === "subtle" && "ui-card-head--bar-subtle", 
                // The caption treatment — uppercase, tracked out — belongs to a
                // plain string. `title` is a ReactNode, and forcing text-transform
                // on a slot the caller composes means a badge and a relative
                // timestamp come out as "2 DAYS AGO" with no way to opt out.
                headBar && typeof title === "string" && "ui-card-head--caption"), children: [_jsxs("div", { className: "ui-card-head-text", children: [title && (_jsxs("h3", { className: "ui-card-title", children: [title, help] })), subtitle && _jsx("p", { className: "ui-card-subtitle", children: subtitle })] }), actions && _jsx("div", { className: "ui-card-actions", children: actions })] })), children] }));
}
