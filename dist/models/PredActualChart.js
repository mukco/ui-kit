import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { GlossaryTip } from "../primitives/GlossaryTip";
import { ML_GLOSSARY } from "./glossary";
const MUTED = "var(--muted)";
const BORDER = "var(--border)";
const BRAND = "var(--brand)";
const TOOLTIP_STYLE = {
    background: "var(--surface-2)",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    itemStyle: { color: "var(--text)", fontSize: 12 },
};
function ResidualsHistogram({ yTrue, yPred }) {
    const bins = useMemo(() => {
        const residuals = yPred.map((p, i) => p - yTrue[i]);
        if (!residuals.length)
            return [];
        const min = Math.min(...residuals);
        const max = Math.max(...residuals);
        const range = max - min || 1;
        const buckets = 20;
        const width = range / buckets;
        const counts = Array(buckets).fill(0);
        for (const r of residuals) {
            counts[Math.min(Math.floor((r - min) / width), buckets - 1)]++;
        }
        return counts.map((count, i) => ({ mid: +(min + (i + 0.5) * width).toFixed(3), count }));
    }, [yTrue, yPred]);
    return (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsxs("div", { className: "ui-mlhead", children: [_jsxs("p", { className: "ui-chart-title", children: ["Residuals distribution ", _jsx("span", { className: "ui-mlsoft", children: "(predicted \u2212 actual)" })] }), _jsx(GlossaryTip, { hint: ML_GLOSSARY.residuals })] }), _jsx("p", { className: "ui-sb-note", children: "A symmetric bell centred near 0 means errors are unbiased." }), _jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(BarChart, { data: bins, margin: { left: 4, right: 8, bottom: 20 }, children: [_jsx(XAxis, { dataKey: "mid", type: "number", domain: ["dataMin", "dataMax"], tick: { fill: MUTED, fontSize: 10 }, tickFormatter: (v) => v.toFixed(2), label: { value: "Residual (predicted − actual)", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 11 } }), _jsx(YAxis, { tick: { fill: MUTED, fontSize: 10 }, width: 32, label: { value: "Count", angle: -90, position: "insideLeft", offset: 14, fill: MUTED, fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { ...TOOLTIP_STYLE }, formatter: (val) => [String(val), "rows"], labelFormatter: (v) => `Residual ≈ ${Number(v).toFixed(3)}` }), _jsx(ReferenceLine, { x: 0, stroke: MUTED, strokeDasharray: "3 3", strokeOpacity: 0.7 }), _jsx(Bar, { dataKey: "count", fill: BRAND, fillOpacity: 0.75, radius: [2, 2, 0, 0] })] }) })] }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props) {
    const { cx, cy } = props;
    return _jsx("circle", { cx: cx, cy: cy, r: 3, fill: "var(--brand)", fillOpacity: 0.55, stroke: "none" });
}
/** Predicted-vs-actual scatter against the diagonal, plus the residual
    histogram — the two plots that grade a regression honestly. */
export function PredActualChart({ testPredictions, target }) {
    const { y_true, y_pred, sampled } = testPredictions;
    const points = y_true.map((t, i) => ({ true: t, pred: y_pred[i] }));
    const allVals = [...y_true, ...y_pred];
    const lo = Math.min(...allVals);
    const hi = Math.max(...allVals);
    return (_jsxs("div", { className: "ui-mlstack", children: [_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsxs("p", { className: "ui-chart-title", children: ["Predicted vs Actual \u2014 ", target ?? "target", sampled && _jsx("span", { className: "ui-mlsoft", children: " (500-point sample)" })] }), _jsx("p", { className: "ui-sb-note", style: { marginBottom: 12 }, children: "Points on the diagonal = perfect predictions. Spread = error magnitude." }), _jsx(ResponsiveContainer, { width: "100%", height: 240, children: _jsxs(ScatterChart, { margin: { left: 4, right: 8, bottom: 20 }, children: [_jsx(XAxis, { dataKey: "true", type: "number", name: "Actual", domain: [lo, hi], tick: { fill: MUTED, fontSize: 10 }, label: { value: "Actual", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 11 } }), _jsx(YAxis, { dataKey: "pred", type: "number", name: "Predicted", domain: [lo, hi], tick: { fill: MUTED, fontSize: 10 }, width: 50, label: { value: "Predicted", angle: -90, position: "insideLeft", offset: 10, fill: MUTED, fontSize: 11 } }), _jsx(Tooltip, { contentStyle: { ...TOOLTIP_STYLE }, formatter: (val) => [Number(val).toFixed(4)] }), _jsx(ReferenceLine, { segment: [{ x: lo, y: lo }, { x: hi, y: hi }], stroke: "var(--border-strong)", strokeDasharray: "4 3" }), _jsx(Scatter, { data: points, shape: _jsx(CustomDot, {}) })] }) })] }), _jsx(ResidualsHistogram, { yTrue: y_true, yPred: y_pred })] }));
}
