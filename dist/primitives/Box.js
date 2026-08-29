import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
const SURFACE_CLASS = {
    surface: "ui-box--surface",
    "surface-2": "ui-box--surface-2",
    transparent: "ui-box--transparent",
};
const PADDING_CLASS = {
    none: "ui-box--pad-none",
    sm: "ui-box--pad-sm",
    md: "ui-box--pad-md",
    lg: "ui-box--pad-lg",
};
export function Box({ children, surface = "surface", padding = "md", border = true, className }) {
    return (_jsx("div", { className: cn("ui-box", SURFACE_CLASS[surface], PADDING_CLASS[padding], border && "ui-box--border", className), children: children }));
}
