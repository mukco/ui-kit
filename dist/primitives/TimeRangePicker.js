import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
export const DEFAULT_TIME_RANGES = [
    { id: "1h", label: "1h", hours: 1 },
    { id: "6h", label: "6h", hours: 6 },
    { id: "24h", label: "24h", hours: 24 },
    { id: "7d", label: "7d", hours: 168 },
];
/**
 * One range, obeyed by every panel on the page.
 *
 * The spine of a monitoring screen: pick six hours here and the sparklines,
 * the charts and the counts all move together, so two panels are never quietly
 * describing two different afternoons. DateNav is the wrong shape for this —
 * it steps through days one at a time, which answers a different question.
 */
export function TimeRangePicker({ value, onChange, ranges = DEFAULT_TIME_RANGES, className, }) {
    return (_jsx("div", { className: cn("ui-range", className), role: "radiogroup", "aria-label": "Time range", children: ranges.map((range) => (_jsx("button", { type: "button", role: "radio", "aria-checked": range.id === value, className: cn("ui-range-opt", range.id === value && "is-on"), onClick: () => onChange(range), children: range.label }, range.id))) }));
}
