import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
const TOOLTIP_STYLE = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    itemStyle: { color: "var(--text)", fontSize: 12 },
};
/** Per-class precision / recall / F1 with support in the tooltip — where a
    classifier is quietly failing on rare classes. */
export function ClassBreakdownChart({ classBreakdown }) {
    if (!classBreakdown || classBreakdown.length === 0)
        return null;
    const data = classBreakdown.map((c) => ({
        name: c.class,
        Precision: c.precision,
        Recall: c.recall,
        F1: c.f1,
        support: c.support,
    }));
    return (_jsxs("div", { className: "ui-card ui-mlcard", children: [_jsx("p", { className: "ui-chart-title", children: "Per-class precision / recall / F1" }), _jsx("p", { className: "ui-sb-note", style: { marginBottom: 12 }, children: "Support (n rows) shown in tooltip. Weak classes often have small support \u2014 check your bins." }), _jsx(ResponsiveContainer, { width: "100%", height: Math.max(160, classBreakdown.length * 50), children: _jsxs(BarChart, { data: data, layout: "vertical", margin: { left: 8, right: 16, top: 4 }, children: [_jsx(XAxis, { type: "number", domain: [0, 1], tick: { fill: "var(--muted)", fontSize: 10 } }), _jsx(YAxis, { type: "category", dataKey: "name", tick: { fill: "var(--text-2)", fontSize: 11 }, width: 72 }), _jsx(Tooltip, { contentStyle: { ...TOOLTIP_STYLE }, 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter: (val, name, props) => {
                                const extra = name === "Precision" ? ` (n=${props.payload.support})` : "";
                                return [`${Number(val).toFixed(3)}${extra}`, String(name)];
                            } }), _jsx(Legend, { wrapperStyle: { fontSize: 11, color: "var(--muted)" } }), _jsx(Bar, { dataKey: "Precision", fill: "#2563EB", radius: [0, 3, 3, 0], barSize: 8 }), _jsx(Bar, { dataKey: "Recall", fill: "#16A34A", radius: [0, 3, 3, 0], barSize: 8 }), _jsx(Bar, { dataKey: "F1", fill: "#9333EA", radius: [0, 3, 3, 0], barSize: 8 })] }) })] }));
}
