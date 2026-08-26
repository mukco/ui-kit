import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell, YAxis } from "recharts";
import { cn } from "../cn";
function primaryMetric(run) {
    const m = run.result?.metrics ?? {};
    return run.result?.task === "regression" ? (m.r2 ?? null) : (m.accuracy ?? null);
}
function metricColor(val) {
    if (val == null)
        return "var(--muted)";
    if (val >= 0.7)
        return "var(--brand)";
    if (val >= 0.4)
        return "var(--sev-warn)";
    return "var(--sev-error)";
}
function shortLabel(run) {
    return `${(run.config.model_type ?? "").replace(/_/g, " ")} · ${run.config.target ?? "?"}`.slice(0, 24);
}
function RunCard({ run, onLoad, onDelete, onAsk, isSelected }) {
    const date = new Date(run.created_at);
    const label = `${(run.config.model_type ?? "").replace(/_/g, " ")} · ${run.config.target ?? "?"}`;
    const m = run.result?.metrics ?? {};
    const isReg = run.result?.task === "regression";
    const primary = primaryMetric(run);
    const pct = primary != null ? Math.min(100, Math.max(0, primary * 100)) : null;
    return (_jsxs("div", { className: cn("ui-card ui-runcard", isSelected && "ui-runcard--selected"), onClick: () => onLoad(run), children: [_jsxs("div", { className: "ui-runcard-head", children: [_jsxs("div", { className: "ui-runcard-titles", children: [_jsx("p", { className: "ui-runcard-label", children: label }), _jsxs("p", { className: "ui-sb-note", children: [run.config.table, " \u00B7 ", (run.config.features ?? []).length, " features"] }), _jsxs("p", { className: "ui-sb-note", children: [date.toLocaleDateString(), " ", date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })] })] }), _jsxs("div", { className: "ui-runcard-actions", children: [onAsk && (_jsx("button", { type: "button", onClick: (e) => {
                                    e.stopPropagation();
                                    onAsk(run);
                                }, className: "ui-iconbtn", title: "Chat about this run", children: "\uD83D\uDCAC" })), onDelete && (_jsx("button", { type: "button", onClick: (e) => {
                                    e.stopPropagation();
                                    onDelete(run.id);
                                }, className: "ui-iconbtn ui-iconbtn--danger", title: "Delete run", children: "\u2715" }))] })] }), _jsx("div", { className: "ui-mlchips", children: isReg ? (_jsxs(_Fragment, { children: [m.r2 != null && _jsx(SummaryChip, { label: "R\u00B2", val: m.r2.toFixed(3) }), m.rmse != null && _jsx(SummaryChip, { label: "RMSE", val: m.rmse.toFixed(3) })] })) : (_jsxs(_Fragment, { children: [m.accuracy != null && _jsx(SummaryChip, { label: "Acc", val: `${(m.accuracy * 100).toFixed(0)}%` }), m.f1 != null && _jsx(SummaryChip, { label: "F1", val: m.f1.toFixed(3) })] })) }), pct != null && (_jsx("div", { className: "ui-bar", children: _jsx("div", { className: "ui-bar-fill", style: { width: `${pct}%`, background: metricColor(primary) } }) }))] }));
}
function SummaryChip({ label, val }) {
    return (_jsxs("span", { className: "ui-summarychip", children: [_jsx("span", { className: "ui-sb-note", children: label }), _jsx("span", { className: "ui-mono", children: val })] }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length)
        return null;
    const d = payload[0].payload;
    return (_jsxs("div", { className: "ui-tooltip", children: [_jsx("p", { className: "ui-tooltip-title", children: d.label }), _jsxs("p", { className: "ui-tooltip-row", children: [d.metricLabel, ": ", _jsx("strong", { children: d.value?.toFixed(3) })] })] }));
}
/** Saved-run browser for an ML builder: mini bar chart of the primary metric
    across recent runs plus clickable run cards. Data comes in via props. */
export function RunHistory({ runs, loading, selectedRunId, compareRunId, onLoad, onDelete, onAsk, onCompare }) {
    if (loading)
        return _jsx("p", { className: "ui-sb-note", children: "Loading runs\u2026" });
    if (!runs.length)
        return _jsx("p", { className: "ui-sb-note", children: "No saved runs yet. Train a model to start." });
    const isReg = runs[0]?.result?.task === "regression";
    const metricLabel = isReg ? "R²" : "Accuracy";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartData = runs
        .slice(0, 10)
        .map((r) => ({ id: r.id, label: shortLabel(r), value: primaryMetric(r), metricLabel, run: r }))
        .filter((d) => d.value != null)
        .reverse();
    return (_jsxs("div", { className: "ui-runhistory", children: [_jsxs("div", { className: "ui-chart-head", children: [_jsxs("p", { className: "ui-chart-title", children: ["Run history (", runs.length, ")"] }), onCompare && runs.length >= 2 && (_jsx("button", { type: "button", onClick: onCompare, className: "ui-insights-regen", children: "Compare \u2192" }))] }), chartData.length >= 2 && (_jsxs("div", { style: { padding: "0 4px 4px" }, children: [_jsxs("p", { className: "ui-sb-note", style: { marginBottom: 4 }, children: [metricLabel, " across runs \u2014 click a bar to load"] }), _jsx(ResponsiveContainer, { width: "100%", height: 96, children: _jsxs(BarChart, { data: chartData, margin: { top: 4, right: 4, bottom: 4, left: -20 }, children: [_jsx(YAxis, { domain: [0, 1], tick: { fontSize: 9, fill: "var(--muted)" }, tickCount: 3 }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}), cursor: { fill: "color-mix(in srgb, var(--text) 8%, transparent)" } }), _jsx(Bar, { dataKey: "value", radius: [3, 3, 0, 0], onClick: (d) => d?.run && onLoad(d.run), style: { cursor: "pointer" }, children: chartData.map((d) => (_jsx(Cell, { fill: metricColor(d.value) }, d.id))) })] }) })] })), runs.map((run) => (_jsx(RunCard, { run: run, onLoad: () => onLoad(run), onDelete: onDelete, onAsk: onAsk, isSelected: run.id === selectedRunId || run.id === compareRunId }, run.id)))] }));
}
