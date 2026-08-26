import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
const TOOLTIP_STYLE = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    itemStyle: { color: "var(--text)", fontSize: 12 },
};
const LOWER_BETTER = new Set(["RMSE", "MAE"]);
function metricsRows(task, m) {
    if (task === "regression") {
        return [
            { label: "R²", val: m?.r2 },
            { label: "RMSE", val: m?.rmse },
            { label: "MAE", val: m?.mae },
        ];
    }
    return [
        { label: "Accuracy", val: m?.accuracy },
        { label: "F1", val: m?.f1 },
        { label: "Precision", val: m?.precision },
        { label: "Recall", val: m?.recall },
    ];
}
function shortLabel(run) {
    return `${(run.config.model_type ?? "").replace(/_/g, " ")} / ${run.config.target ?? "?"}`;
}
function MetricRow({ label, a, b }) {
    if (a == null && b == null)
        return null;
    const better = a != null && b != null
        ? LOWER_BETTER.has(label)
            ? a < b
                ? "a"
                : a > b
                    ? "b"
                    : null
            : a > b
                ? "a"
                : a < b
                    ? "b"
                    : null
        : null;
    return (_jsxs("tr", { children: [_jsx("td", { className: "ui-sb-note", children: label }), _jsx("td", { className: better === "a" ? "ui-compare-best" : "", children: a != null ? a.toFixed(4) : "—" }), _jsx("td", { className: better === "b" ? "ui-compare-best" : "", children: b != null ? b.toFixed(4) : "—" })] }));
}
function FeatureCompare({ runA, runB }) {
    const fiA = Object.fromEntries((runA.result?.feature_importance ?? []).map((f) => [f.feature, f.importance]));
    const fiB = Object.fromEntries((runB.result?.feature_importance ?? []).map((f) => [f.feature, f.importance]));
    const allFeatures = Array.from(new Set([...Object.keys(fiA), ...Object.keys(fiB)]));
    if (allFeatures.length === 0)
        return null;
    const data = allFeatures
        .map((f) => ({ feature: f, A: +(fiA[f] ?? 0).toFixed(4), B: +(fiB[f] ?? 0).toFixed(4) }))
        .sort((x, y) => y.A + y.B - (x.A + x.B))
        .slice(0, 12);
    return (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsx("p", { className: "ui-chart-title", children: "Feature importance comparison" }), _jsx(ResponsiveContainer, { width: "100%", height: Math.max(140, data.length * 28), children: _jsxs(BarChart, { data: data, layout: "vertical", margin: { left: 8, right: 16 }, children: [_jsx(XAxis, { type: "number", tick: { fill: "var(--muted)", fontSize: 10 } }), _jsx(YAxis, { type: "category", dataKey: "feature", tick: { fill: "var(--text-2)", fontSize: 11 }, width: 110 }), _jsx(Tooltip, { contentStyle: { ...TOOLTIP_STYLE } }), _jsx(Legend, { wrapperStyle: { fontSize: 11, color: "var(--muted)" } }), _jsx(Bar, { dataKey: "A", name: shortLabel(runA).slice(0, 20), fill: "var(--brand)", radius: [0, 3, 3, 0], barSize: 8 }), _jsx(Bar, { dataKey: "B", name: shortLabel(runB).slice(0, 20), fill: "var(--series-2)", radius: [0, 3, 3, 0], barSize: 8 })] }) })] }));
}
/** Side-by-side diff of two training runs: config differences highlighted,
    best metric in green per row, feature importances overlaid. */
export function RunComparison({ runA, runB, onClose }) {
    if (!runA || !runB)
        return null;
    const task = runA.result?.task ?? runB.result?.task ?? "regression";
    const rowsA = metricsRows(task, runA.result?.metrics);
    const rowsB = metricsRows(task, runB.result?.metrics);
    function configRow(label, fn) {
        return { label, a: fn(runA.config), b: fn(runB.config), diff: fn(runA.config) !== fn(runB.config) };
    }
    const configRows = [
        configRow("Model", (c) => (c.model_type ?? "").replace(/_/g, " ")),
        configRow("Table", (c) => c.table || "—"),
        configRow("Target", (c) => c.target || "—"),
        configRow("Features", (c) => `${(c.features ?? []).length} cols`),
        configRow("Task", (c) => c.task || "—"),
        configRow("Test size", (c) => `${(((c.test_size ?? 0.2) * 100)).toFixed(0)}%`),
    ];
    return (_jsxs("div", { className: "ui-mlstack", children: [_jsxs("div", { className: "ui-mlhead", children: [_jsx("h3", { className: "ui-expandable-title", children: "Run comparison" }), onClose && (_jsx("button", { type: "button", onClick: onClose, className: "ui-sb-note", children: "\u2715 Close" }))] }), _jsxs("div", { className: "ui-card ui-mlcard", children: [_jsx("p", { className: "ui-chart-title", children: "Configuration" }), _jsxs("table", { className: "ui-comparetable", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", {}), _jsx("th", { children: "Run A" }), _jsx("th", { children: "Run B" })] }) }), _jsx("tbody", { children: configRows.map(({ label, a, b, diff }) => (_jsxs("tr", { style: { background: diff ? "color-mix(in srgb, var(--warn) 8%, transparent)" : undefined }, children: [_jsx("td", { children: label }), _jsx("td", { children: String(a) }), _jsx("td", { children: String(b) })] }, label))) })] })] }), _jsxs("div", { className: "ui-card ui-mlcard", children: [_jsxs("p", { className: "ui-chart-title", children: ["Metrics ", _jsx("span", { className: "ui-mlsoft", children: "(green = better)" })] }), _jsxs("table", { className: "ui-comparetable", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", {}), _jsx("th", { children: "Run A" }), _jsx("th", { children: "Run B" })] }) }), _jsx("tbody", { children: rowsA.map(({ label }, i) => (_jsx(MetricRow, { label: label, a: rowsA[i].val, b: rowsB[i]?.val }, label))) })] })] }), _jsx(FeatureCompare, { runA: runA, runB: runB })] }));
}
