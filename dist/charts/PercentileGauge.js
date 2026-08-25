import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
function pctColor(p) {
    if (p >= 85)
        return "var(--stat-elite)";
    if (p >= 65)
        return "var(--stat-great)";
    if (p >= 40)
        return "var(--stat-avg)";
    if (p >= 20)
        return "var(--stat-below)";
    return "var(--stat-poor)";
}
const NEUTRAL = "var(--muted)";
const ZONES = [
    { from: 0, to: 20, fill: "var(--stat-poor)" },
    { from: 20, to: 40, fill: "var(--stat-below)" },
    { from: 40, to: 65, fill: "var(--stat-avg)" },
    { from: 65, to: 85, fill: "var(--stat-great)" },
    { from: 85, to: 100, fill: "var(--stat-elite)" },
];
const TICKS = [25, 50, 75];
function GaugeRow({ label, value, percentile, neutral }) {
    if (percentile == null)
        return null;
    const color = neutral ? NEUTRAL : pctColor(percentile);
    const bubbleLeft = Math.max(4, Math.min(96, percentile));
    return (_jsxs("div", { className: "ui-gaugerow", children: [_jsx("span", { className: "ui-gauge-label", children: label }), _jsx("span", { className: "ui-mono ui-gauge-value", children: value ?? "—" }), _jsxs("div", { className: "ui-gauge-trackwrap", children: [neutral ? (_jsx("div", { className: "ui-gauge-track", style: { backgroundColor: NEUTRAL } })) : (_jsx("div", { className: "ui-gauge-track", children: ZONES.map((z) => (_jsx("div", { className: "ui-gauge-zone", style: { left: `${z.from}%`, width: `${z.to - z.from}%`, backgroundColor: z.fill } }, z.from))) })), TICKS.map((t) => (_jsx("div", { className: "ui-gauge-tick", style: { left: `${t}%` } }, t))), _jsx("div", { className: "ui-gauge-bubble", style: { left: `${bubbleLeft}%`, backgroundColor: color }, title: `${percentile}th percentile`, children: _jsx("span", { children: percentile }) })] })] }));
}
/** Percentile sliders: label · value · a track banded poor→elite with the
    percentile riding the bar as a bubble. Grouped by category, sorted
    best→worst within each group. */
export function PercentileGauge({ stats = [], className }) {
    const visible = stats.filter((s) => s.percentile != null);
    if (!visible.length)
        return null;
    const order = [];
    const groups = {};
    for (const s of visible) {
        const cat = s.category ?? "";
        if (!groups[cat]) {
            groups[cat] = [];
            order.push(cat);
        }
        groups[cat].push(s);
    }
    for (const cat of order) {
        groups[cat].sort((a, b) => (a.neutral || b.neutral ? 0 : (b.percentile ?? 0) - (a.percentile ?? 0)));
    }
    return (_jsxs("div", { className: cn("ui-gauge", className), children: [_jsxs("div", { className: "ui-gaugerow ui-gauge-headrow", children: [_jsx("span", {}), _jsx("span", { className: "ui-sb-label", children: "Value" }), _jsx("div", { className: "ui-gauge-scale", children: [0, 25, 50, 75, 100].map((t) => (_jsx("span", { style: { left: `${Math.max(2, Math.min(98, t))}%` }, children: t }, t))) })] }), order.map((cat) => (_jsxs("div", { children: [cat && _jsx("div", { className: "ui-gauge-cat", children: cat }), _jsx("div", { children: groups[cat].map((s) => (_jsx(GaugeRow, { ...s }, s.label))) })] }, cat || "_")))] }));
}
