import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
export function MetricStrip({ cells, lead, compact, fixed, trailing, className }) {
    return (_jsxs("div", { className: cn("ui-mstrip", compact && "ui-mstrip--compact", fixed && "ui-mstrip--fixed", className), children: [lead != null && _jsx("div", { className: "ui-mstrip-lead", children: lead }), cells.map((c) => (_jsxs("div", { className: "ui-mstrip-cell", children: [_jsx("div", { className: cn("ui-mstrip-val", c.value == null && "ui-mstrip-val--empty", c.valueClassName), children: c.value ?? "·" }), _jsxs("div", { className: "ui-mstrip-label", children: [c.label, c.help] }), c.extra] }, c.key))), trailing] }));
}
