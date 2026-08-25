import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { ComposedChart, Area, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { fmtDay, fmtShortDay } from "../lib/days";
function rollingAvg(data, key, window) {
    return data.map((d, i) => {
        const slice = data.slice(Math.max(0, i - window + 1), i + 1);
        const vals = slice.map((x) => Number(x[key])).filter(Number.isFinite);
        return { ...d, _avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null };
    });
}
const BORDER = "var(--border-strong)";
const MUTED = "var(--muted)";
function CustomTooltip({ active, payload, valueKey, valueLabel, formatValue }) {
    if (!active || !payload?.length)
        return null;
    const d = (payload[0]?.payload ?? {});
    const dateLabel = d.date ? fmtDay(d.date) : "";
    const raw = d[valueKey];
    return (_jsxs("div", { className: "ui-tooltip", children: [_jsx("p", { className: "ui-tooltip-title", children: dateLabel }), d.opponent && (_jsxs("p", { className: "ui-tooltip-row", children: [d.isHome ? "vs" : "@", " ", d.opponent] })), raw != null && Number.isFinite(Number(raw)) && (_jsxs("p", { className: "ui-tooltip-row", children: [valueLabel, ": ", _jsx("strong", { children: formatValue(Number(raw)) })] })), d._avg != null && (_jsxs("p", { className: "ui-tooltip-row", children: ["Rolling: ", _jsx("strong", { children: d._avg.toFixed(1) })] }))] }));
}
/**
 * Per-game dots with a rolling-average area line over them — the shape for
 * "how has this been trending lately?"
 */
export function RollingAverageChart({ data = [], valueKey = "ops", valueLabel = "OPS", title = null, color = "var(--brand)", windowSize = 10, reference = null, height = 200, formatValue = (v) => Number(v).toFixed(3), }) {
    const processed = useMemo(() => rollingAvg(data ?? [], valueKey, windowSize), [data, valueKey, windowSize]);
    const vals = processed.map((d) => Number(d[valueKey])).filter(Number.isFinite);
    if (!vals.length)
        return _jsx("div", { className: "ui-chart-empty", children: "No data" });
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = Math.max((max - min) * 0.12, 0.05);
    const tickData = processed.map((d, i) => {
        let label = String(i + 1);
        if (typeof d.date === "string")
            label = fmtShortDay(d.date);
        return { ...d, _idx: i, _label: label };
    });
    const step = Math.max(1, Math.floor(tickData.length / 6));
    const ticks = tickData.filter((_, i) => i % step === 0).map((d) => d._idx);
    const gradId = `ui-ra-${valueKey}`;
    // Current rolling value + net change across the span; level and direction
    // together tell the story.
    const avgs = processed.map((d) => d._avg).filter((v) => v != null && Number.isFinite(v));
    const current = avgs.length ? avgs[avgs.length - 1] : null;
    const delta = avgs.length >= 2 ? avgs[avgs.length - 1] - avgs[0] : null;
    const valueChip = current == null ? null : (_jsxs("span", { className: "ui-chip", children: [_jsx("span", { className: "ui-chip-value", title: `Current ${valueLabel} (rolling avg)`, children: formatValue(current) }), delta != null && Math.abs(delta) > 0 && (_jsxs("span", { className: "ui-chip-delta", style: { color: delta >= 0 ? "var(--stat-great)" : "var(--stat-poor)" }, title: `${valueLabel} change over span`, children: [delta >= 0 ? "▲" : "▼", formatValue(Math.abs(delta))] }))] }));
    return (_jsxs("div", { children: [title && (_jsxs("div", { className: "ui-chart-head", style: { marginBottom: 4 }, children: [_jsx("span", { className: "ui-chart-title", children: title }), valueChip] })), _jsxs("div", { style: { position: "relative" }, children: [!title && valueChip && (_jsx("div", { style: {
                            position: "absolute",
                            left: 36,
                            top: 0,
                            zIndex: 10,
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            background: "color-mix(in srgb, var(--surface) 80%, transparent)",
                        }, children: valueChip })), _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(ComposedChart, { data: tickData, margin: { top: 8, right: 12, bottom: 16, left: -8 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: color, stopOpacity: 0.35 }), _jsx("stop", { offset: "95%", stopColor: color, stopOpacity: 0.02 })] }) }), _jsx(CartesianGrid, { stroke: BORDER, strokeDasharray: "3 3", strokeOpacity: 0.6, vertical: false }), _jsx(XAxis, { dataKey: "_idx", type: "number", domain: [0, tickData.length - 1], ticks: ticks, tickFormatter: (i) => tickData[i]?._label ?? "", tick: { fill: MUTED, fontSize: 11 }, axisLine: { stroke: BORDER }, tickLine: false }), _jsx(YAxis, { domain: [Math.max(0, min - pad), max + pad], tickFormatter: (v) => {
                                        if (!Number.isFinite(v))
                                            return String(v);
                                        if (Number.isInteger(v))
                                            return String(v);
                                        if (Math.abs(v) >= 1)
                                            return v.toFixed(1);
                                        return v.toFixed(2);
                                    }, tick: { fill: MUTED, fontSize: 11 }, axisLine: { stroke: BORDER }, tickLine: false, width: 40 }), _jsx(Tooltip, { content: _jsx(CustomTooltip, { valueKey: valueKey, valueLabel: valueLabel, formatValue: formatValue }), cursor: { stroke: BORDER } }), reference != null && _jsx(ReferenceLine, { y: reference, stroke: MUTED, strokeDasharray: "4 4", strokeWidth: 1 }), _jsx(Scatter, { dataKey: valueKey, fill: color, fillOpacity: 0.18, r: 2, line: false, isAnimationActive: false }), _jsx(Area, { dataKey: "_avg", type: "monotone", stroke: color, strokeWidth: 2.5, fill: `url(#${gradId})`, dot: false, activeDot: { r: 4, fill: color, strokeWidth: 0 }, connectNulls: true, isAnimationActive: false })] }) })] })] }));
}
