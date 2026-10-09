import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from "../cn";
const MIN = 20;
const MAX = 80;
const pct = (v) => `${((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * 100}%`;
export function ratingTier(v) {
    if (v >= 75)
        return "elite";
    if (v >= 65)
        return "plus";
    if (v >= 55)
        return "above";
    if (v >= 50)
        return "average";
    if (v >= 40)
        return "below";
    return "poor";
}
const HEAT = { poor: "--stat-poor", below: "--stat-below", average: "--stat-avg", above: "--stat-great", plus: "--stat-elite", elite: "--stat-elite" };
/** The heat colour of a 20–80 rating. */
export const ratingHeat = (v) => `var(${HEAT[ratingTier(v)]})`;
export function RatingBar({ label, current, potentialLow, potentialHigh, className }) {
    const low = potentialLow ?? current;
    const high = potentialHigh ?? current;
    const growing = high > current;
    return (_jsxs("div", { className: cn("ui-ratingbar", `ui-ratingbar--${ratingTier(current)}`, className), children: [_jsx("span", { className: "ui-ratingbar-label", children: label }), _jsxs("span", { className: "ui-ratingbar-track", "aria-hidden": "true", children: [_jsx("span", { className: "ui-ratingbar-fill", style: { width: pct(current) } }), growing && _jsx("span", { className: "ui-ratingbar-range", style: { left: pct(Math.max(low, current)), width: `calc(${pct(high)} - ${pct(Math.max(low, current))})` } }), _jsx("span", { className: "ui-ratingbar-mid", style: { left: pct(50) } })] }), _jsxs("span", { className: "ui-ratingbar-value", children: [_jsx("strong", { children: current }), growing && (_jsx("span", { className: "ui-ratingbar-pot", children: low === high ? _jsx("span", { style: { color: ratingHeat(high) }, children: high }) : _jsxs(_Fragment, { children: [_jsx("span", { style: { color: ratingHeat(low) }, children: low }), "\u2013", _jsx("span", { style: { color: ratingHeat(high) }, children: high })] }) }))] })] }));
}
