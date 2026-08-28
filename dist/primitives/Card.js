import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
/** The kit's basic surface: bordered, rounded, subtly elevated. */
export function Card({ children, className, title, subtitle, help, actions }) {
    return (_jsxs("section", { className: cn("ui-card", className), children: [(title || actions) && (_jsxs("div", { className: "ui-card-head", children: [_jsxs("div", { className: "ui-card-head-text", children: [title && (_jsxs("h3", { className: "ui-card-title", children: [title, help] })), subtitle && _jsx("p", { className: "ui-card-subtitle", children: subtitle })] }), actions && _jsx("div", { className: "ui-card-actions", children: actions })] })), children] }));
}
