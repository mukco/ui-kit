import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** A friendly nothing-here block. */
export function EmptyState({ icon = "∅", children, className }) {
    return (_jsxs("div", { className: cn("ui-empty", className), children: [_jsx("span", { className: "ui-empty-icon", "aria-hidden": "true", children: icon }), _jsx("span", { children: children })] }));
}
