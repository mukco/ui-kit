import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** A screen's header line: optional back arrow, title, subtitle, actions. */
export function PageHeader({ title, subtitle, actions, onBack, className }) {
    return (_jsxs("header", { className: cn("ui-pagehead", className), children: [onBack && (_jsx("button", { type: "button", className: "ui-pagehead-back", "aria-label": "Back", onClick: onBack, children: "\u2190" })), _jsxs("div", { className: "ui-pagehead-titles", children: [_jsx("h1", { className: "ui-pagehead-title", children: title }), subtitle && _jsx("p", { className: "ui-pagehead-sub", children: subtitle })] }), actions && _jsx("div", { className: "ui-pagehead-actions", children: actions })] }));
}
