import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** A friendly nothing-here block. */
export function EmptyState({ icon = "∅", children, compact = false, className }) {
    return (_jsxs("div", { className: cn("ui-empty", compact && "ui-empty--compact", className), role: "status", children: [_jsx("span", { className: "ui-empty-icon", "aria-hidden": "true", children: icon }), _jsx("span", { children: children })] }));
}
