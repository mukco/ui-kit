import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** Centered spinner with an optional status line. */
export function Loading({ label, className }) {
    return (_jsxs("div", { className: cn("ui-loading", className), role: "status", children: [_jsx("span", { className: "ui-spinner", "aria-hidden": "true" }), label && _jsx("span", { children: label })] }));
}
