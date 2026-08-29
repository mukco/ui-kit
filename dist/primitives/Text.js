import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
const SIZE_CLASS = {
    sm: "ui-text--sm",
    md: "ui-text--md",
    lg: "ui-text--lg",
    xl: "ui-text--xl",
};
const TONE_CLASS = {
    default: "ui-text--default",
    muted: "ui-text--muted",
    brand: "ui-text--brand",
};
const WEIGHT_CLASS = {
    normal: "ui-text--normal",
    medium: "ui-text--medium",
    bold: "ui-text--bold",
};
export function Text({ children, size = "md", tone = "default", weight = "normal", className }) {
    return _jsx("p", { className: cn("ui-text", SIZE_CLASS[size], TONE_CLASS[tone], WEIGHT_CLASS[weight], className), children: children });
}
