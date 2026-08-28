import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
/**
 * A compact inline toggle between a few short options — switching a metric
 * or view inside a card header. Not Tabs: that's page-level navigation with
 * a full-height strip and an underline; this is a small pill control that
 * lives inside other content.
 */
export function SegmentedControl({ options, active, onChange, className }) {
    return (_jsx("div", { className: cn("ui-segmented", className), children: options.map((o) => (_jsx("button", { type: "button", onClick: () => onChange(o.id), className: cn("ui-segmented-btn", o.id === active && "ui-segmented-btn--active"), children: o.label }, o.id))) }));
}
