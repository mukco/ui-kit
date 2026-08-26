import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
import { useRovingSelect } from "./useRovingSelect";
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
    // role="radiogroup" promises one tab stop and arrow-key navigation. It
    // promised both and provided neither.
    const onKeyDown = useRovingSelect(ranges.map((r) => r.id), value, (id) => {
        const picked = ranges.find((r) => r.id === id);
        if (picked)
            onChange(picked);
    });
    return (_jsx("div", { className: cn("ui-range", className), role: "radiogroup", "aria-label": "Time range", onKeyDown: onKeyDown, children: ranges.map((range) => (_jsx("button", { type: "button", role: "radio", "aria-checked": range.id === value, tabIndex: range.id === value ? 0 : -1, className: cn("ui-range-opt", range.id === value && "is-on"), onClick: () => onChange(range), children: range.label }, range.id))) }));
}
