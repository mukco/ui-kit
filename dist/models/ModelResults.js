import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { PredActualChart } from "./PredActualChart";
import { ClassBreakdownChart } from "./ClassBreakdownChart";
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
function MetricCard({ label, value, hintKey }) {
    return (_jsxs("div", { className: "ui-metriccard", children: [_jsxs("div", { className: "ui-metriccard-label", children: [_jsx("p", { children: label }), hintKey && _jsx(GlossaryTip, { hint: ML_GLOSSARY[hintKey] })] }), _jsx("p", { className: "ui-metriccard-value", children: value })] }));
}
function SummaryChip({ label, value }) {
    return (_jsxs("span", { className: "ui-summarychip", children: [_jsx("span", { className: "ui-sb-note", children: label }), _jsx("span", { className: "ui-summarychip-value", children: value })] }));
}
/** The full training-result readout: summary chips, metrics with hints,
    loss curve, feature importance, pred-vs-actual or per-class breakdown,
    and the confusion matrix. */
export function ModelResults({ results }) {
    const { model_type, task, metrics, confusion_matrix, confusion_labels, class_breakdown, test_predictions, feature_importance, loss_history, parameter_count, architecture, train_samples, test_samples, training_time_ms, target, } = results;
    const isClassification = task === "classification";
    const lossData = loss_history?.map((loss, i) => ({ epoch: i + 1, loss })) ?? [];
    const topFeatures = (feature_importance ?? []).slice(0, 12);
    const importanceData = topFeatures.map((f) => ({ name: f.feature, value: f.importance }));
    return (_jsxs("div", { className: "ui-mlstack", children: [_jsxs("div", { className: "ui-mlchips", children: [_jsx(SummaryChip, { label: "Model", value: model_type.replace(/_/g, " ") }), _jsx(SummaryChip, { label: "Task", value: task }), train_samples != null && _jsx(SummaryChip, { label: "Train", value: `${train_samples} rows` }), test_samples != null && _jsx(SummaryChip, { label: "Test", value: `${test_samples} rows` }), training_time_ms != null && _jsx(SummaryChip, { label: "Time", value: `${(training_time_ms / 1000).toFixed(1)}s` }), parameter_count != null && _jsx(SummaryChip, { label: "Parameters", value: parameter_count.toLocaleString() })] }), architecture && (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsx("p", { className: "ui-sb-note", children: "Architecture" }), _jsx("p", { className: "ui-arch-string", children: architecture })] })), _jsxs("div", { className: "ui-card ui-mlcard", children: [_jsx("p", { className: "ui-chart-title", children: "Metrics" }), isClassification ? (_jsxs("div", { className: "ui-metricgrid ui-metricgrid--2", children: [_jsx(MetricCard, { label: "Accuracy", value: `${(metrics.accuracy * 100).toFixed(1)}%`, hintKey: "accuracy" }), _jsx(MetricCard, { label: "F1 Score", value: metrics.f1?.toFixed(3), hintKey: "f1" }), _jsx(MetricCard, { label: "Precision", value: metrics.precision?.toFixed(3), hintKey: "precision" }), _jsx(MetricCard, { label: "Recall", value: metrics.recall?.toFixed(3), hintKey: "recall" })] })) : (_jsxs("div", { className: "ui-metricgrid ui-metricgrid--3", children: [_jsx(MetricCard, { label: "R\u00B2", value: metrics.r2?.toFixed(3), hintKey: "r2" }), _jsx(MetricCard, { label: "RMSE", value: metrics.rmse?.toFixed(2), hintKey: "rmse" }), _jsx(MetricCard, { label: "MAE", value: metrics.mae?.toFixed(2), hintKey: "mae" })] }))] }), lossData.length > 0 && (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsxs("div", { className: "ui-mlhead", children: [_jsx("p", { className: "ui-chart-title", children: "Training loss" }), _jsx(GlossaryTip, { hint: ML_GLOSSARY.training_loss })] }), _jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(LineChart, { data: lossData, children: [_jsx(XAxis, { dataKey: "epoch", tick: { fill: MUTED, fontSize: 11 }, label: { value: "Epoch", position: "insideBottom", offset: -2, fill: MUTED, fontSize: 11 } }), _jsx(YAxis, { tick: { fill: MUTED, fontSize: 11 }, width: 55 }), _jsx(Tooltip, { contentStyle: { ...TOOLTIP_STYLE } }), _jsx(Line, { type: "monotone", dataKey: "loss", stroke: BRAND, dot: false, strokeWidth: 2 })] }) })] })), importanceData.length > 0 && (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsxs("div", { className: "ui-mlhead", children: [_jsx("p", { className: "ui-chart-title", children: "Feature importance" }), _jsx(GlossaryTip, { hint: ML_GLOSSARY.feature_importance })] }), _jsx(ResponsiveContainer, { width: "100%", height: Math.min(280, Math.max(120, importanceData.length * 22)), children: _jsxs(BarChart, { data: importanceData, layout: "vertical", margin: { left: 8, right: 16 }, children: [_jsx(XAxis, { type: "number", tick: { fill: MUTED, fontSize: 10 } }), _jsx(YAxis, { type: "category", dataKey: "name", tick: { fill: "var(--text-2)", fontSize: 11 }, width: 110 }), _jsx(Tooltip, { contentStyle: { ...TOOLTIP_STYLE } }), _jsx(Bar, { dataKey: "value", fill: BRAND, fillOpacity: 0.8, radius: [0, 3, 3, 0] })] }) })] })), test_predictions && _jsx(PredActualChart, { testPredictions: test_predictions, target: target }), class_breakdown && _jsx(ClassBreakdownChart, { classBreakdown: class_breakdown }), confusion_matrix && confusion_labels && (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsxs("p", { className: "ui-chart-title", style: { marginBottom: 12 }, children: ["Confusion matrix ", _jsx("span", { className: "ui-mlsoft", children: "(rows = actual, cols = predicted)" })] }), _jsx("div", { className: "ui-btable-wrap", children: _jsxs("table", { className: "ui-confmatrix", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "actual \\ pred" }), confusion_labels.map((l) => (_jsx("th", { children: l }, l)))] }) }), _jsx("tbody", { children: confusion_matrix.map((row, ri) => {
                                        const rowSum = row.reduce((a, b) => a + b, 0);
                                        return (_jsxs("tr", { children: [_jsx("td", { className: "ui-confmatrix-label", children: confusion_labels[ri] }), row.map((val, ci) => {
                                                    const intensity = rowSum > 0 ? val / rowSum : 0;
                                                    const isCorrect = ri === ci;
                                                    return (_jsx("td", { style: {
                                                            // Tokens with alpha via color-mix rather than a
                                                            // literal rgba: these were brand and danger
                                                            // written out by hand, so the matrix could not
                                                            // follow the theme it sits inside.
                                                            background: isCorrect
                                                                ? `color-mix(in srgb, var(--brand) ${Math.round(Math.max(0.1, intensity) * 100)}%, transparent)`
                                                                : intensity > 0.05
                                                                    ? `color-mix(in srgb, var(--sev-error) ${Math.round(intensity * 60)}%, transparent)`
                                                                    : undefined,
                                                            color: intensity > 0.4 ? "var(--on-brand)" : undefined,
                                                        }, children: val }, ci));
                                                })] }, ri));
                                    }) })] }) })] }))] }));
}
