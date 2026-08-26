import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef } from "react";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, } from "recharts";
import { cn } from "../cn";
const BRAND = "var(--brand)";
const BRAND_LIGHT = "var(--brand-light)";
const BORDER = "var(--border-strong)";
const MUTED = "var(--muted)";
const SURFACE = "var(--surface-2)";
const SECONDARY = "var(--text-2)";
// Categorical palette for multi-series contexts; single-series charts use brand.
//
// Tokens, not literals. This was the Tailwind default swatch written out in
// full, sitting in a kit whose --brand is #1e66e4 — so every multi-series
// chart was coloured by a palette with no relationship to the product, and it
// stayed the same eight colours in dark mode where several of them vanish.
const PALETTE = Array.from({ length: 8 }, (_, i) => `var(--chart-${i + 1})`);
export function chartPalette(i) {
    return PALETTE[i % PALETTE.length];
}
function CustomTooltip({ active, payload, label, xKey, yKey, scatter }) {
    if (!active || !payload?.length)
        return null;
    const entry = payload[0];
    const point = (entry?.payload ?? {});
    const name = (point.name ?? point.Name ?? point.team ?? point.Team ?? "");
    return (_jsx("div", { className: "ui-tooltip", children: scatter ? (_jsxs(_Fragment, { children: [_jsx("p", { className: "ui-tooltip-title", children: name }), _jsxs("p", { className: "ui-tooltip-row", children: [xKey, ": ", _jsx("strong", { children: String(point[xKey] ?? "") })] }), _jsxs("p", { className: "ui-tooltip-row", children: [yKey, ": ", _jsx("strong", { children: String(point[yKey] ?? "") })] })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "ui-tooltip-title", children: String(label ?? point.name ?? "") }), _jsxs("p", { className: "ui-tooltip-row", children: [yKey, ": ", _jsx("strong", { children: String(entry?.value ?? "") })] })] })) }));
}
function tickFormat(v) {
    const n = Number(v);
    if (!Number.isFinite(n))
        return String(v);
    if (Number.isInteger(n))
        return String(n);
    const abs = Math.abs(n);
    if (abs >= 10)
        return n.toFixed(0);
    if (abs >= 1)
        return n.toFixed(1);
    return n.toFixed(2);
}
const AXIS_PROPS = {
    tick: { fill: MUTED, fontSize: 11 },
    axisLine: { stroke: BORDER },
    tickLine: false,
    tickFormatter: tickFormat,
};
const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 16 };
/**
 * The one chart for AI-shaped data: pass rows + which keys to plot and pick a
 * shape. Renders an empty state on no data and offers PNG/CSV export.
 */
export function DynamicChart({ type, title, data, xKey = "name", yKey = "value", color, height = 180 }) {
    const containerRef = useRef(null);
    if (!data?.length) {
        return _jsx("div", { className: "ui-chart-empty", children: title ? `${title} — no data` : "No data" });
    }
    let chart = null;
    if (type === "bar") {
        chart = (_jsxs(BarChart, { data: data, margin: CHART_MARGIN, children: [_jsx(CartesianGrid, { vertical: false, stroke: BORDER, strokeDasharray: "3 3", strokeOpacity: 0.6 }), _jsx(XAxis, { dataKey: xKey, ...AXIS_PROPS, interval: data.length > 12 ? "preserveStartEnd" : 0, minTickGap: 24, tick: { ...AXIS_PROPS.tick, fontSize: 10 } }), _jsx(YAxis, { ...AXIS_PROPS, width: 40 }), _jsx(Tooltip, { content: _jsx(CustomTooltip, { xKey: xKey, yKey: yKey }), cursor: { fill: SURFACE } }), _jsx(Bar, { dataKey: yKey, fill: color || BRAND, fillOpacity: 0.85, radius: [3, 3, 0, 0], maxBarSize: 40 })] }));
    }
    else if (type === "horizontal_bar") {
        chart = (_jsxs(BarChart, { data: data, layout: "vertical", margin: { top: 4, right: 48, left: 4, bottom: 16 }, children: [_jsx(XAxis, { type: "number", ...AXIS_PROPS }), _jsx(YAxis, { type: "category", dataKey: xKey, ...AXIS_PROPS, width: 90, tick: { ...AXIS_PROPS.tick, fontSize: 10 } }), _jsx(Tooltip, { content: _jsx(CustomTooltip, { xKey: xKey, yKey: yKey }), cursor: { fill: SURFACE } }), _jsxs(Bar, { dataKey: yKey, radius: [0, 3, 3, 0], maxBarSize: 16, children: [_jsx(LabelList, { dataKey: yKey, position: "right", style: { fill: SECONDARY, fontSize: 10 } }), data.map((_, i) => (_jsx(Cell, { fill: i === 0 ? BRAND_LIGHT : color || BRAND, fillOpacity: i === 0 ? 1 : 0.65 }, i)))] })] }));
    }
    else if (type === "line") {
        chart = (_jsxs(LineChart, { data: data, margin: CHART_MARGIN, children: [_jsx(CartesianGrid, { stroke: BORDER, strokeDasharray: "3 3", strokeOpacity: 0.6 }), _jsx(XAxis, { dataKey: xKey, ...AXIS_PROPS, interval: "preserveStartEnd", minTickGap: 24 }), _jsx(YAxis, { ...AXIS_PROPS, width: 40 }), _jsx(Tooltip, { content: _jsx(CustomTooltip, { xKey: xKey, yKey: yKey }) }), _jsx(Line, { type: "monotone", dataKey: yKey, stroke: color || BRAND_LIGHT, strokeWidth: 2, dot: { fill: color || BRAND_LIGHT, r: 3 }, activeDot: { r: 5 } })] }));
    }
    else if (type === "scatter") {
        chart = (_jsxs(ScatterChart, { margin: { top: 8, right: 16, left: 0, bottom: 16 }, children: [_jsx(CartesianGrid, { stroke: BORDER, strokeDasharray: "3 3", strokeOpacity: 0.6 }), _jsx(XAxis, { type: "number", dataKey: xKey, name: xKey, ...AXIS_PROPS, label: { value: xKey, position: "insideBottom", offset: -2, fill: MUTED, fontSize: 10 } }), _jsx(YAxis, { type: "number", dataKey: yKey, name: yKey, ...AXIS_PROPS, width: 40, label: { value: yKey, angle: -90, position: "insideLeft", fill: MUTED, fontSize: 10 } }), _jsx(Tooltip, { content: _jsx(CustomTooltip, { xKey: xKey, yKey: yKey, scatter: true }), cursor: { strokeDasharray: "3 3" } }), _jsx(Scatter, { data: data, fill: color || BRAND, fillOpacity: 0.8 })] }));
    }
    if (!chart)
        return null;
    return (_jsxs("div", { className: "ui-chart", children: [_jsxs("div", { className: "ui-chart-head", children: [title && _jsx("p", { className: "ui-chart-title", children: title }), _jsx(ExportButtons, { containerRef: containerRef, title: title, data: data })] }), _jsx("div", { ref: containerRef, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: chart }) })] }));
}
function ExportButtons({ containerRef, title, data }) {
    function exportPng() {
        const svg = containerRef.current?.querySelector("svg");
        if (!svg || !containerRef.current)
            return;
        const rect = svg.getBoundingClientRect();
        const scale = 2;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        canvas.width = rect.width * scale;
        canvas.height = rect.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        ctx.scale(scale, scale);
        // A literal on purpose, and one of only two left in the kit. This paints
        // the background of a PNG export: it goes onto a canvas, which cannot
        // resolve a CSS variable, and a transparent export reads as black in most
        // viewers. The computed style is used when there is one; this is the
        // fallback for when the container has no painted background at all.
        const bgColor = getComputedStyle(containerRef.current).backgroundColor || "#ffffff";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, rect.width, rect.height);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob((pngBlob) => {
                if (!pngBlob)
                    return;
                const a = document.createElement("a");
                a.href = URL.createObjectURL(pngBlob);
                a.download = `${title || "chart"}.png`;
                a.click();
            });
        };
        img.src = url;
    }
    function exportCsv() {
        if (!data.length)
            return;
        const keys = Object.keys(data[0]);
        const rows = [keys.join(","), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))];
        const blob = new Blob([rows.join("\n")], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${title || "chart"}.csv`;
        a.click();
    }
    return (_jsxs("div", { className: cn("ui-export-btns"), children: [_jsx("button", { onClick: exportPng, title: "Download PNG", className: "ui-export-btn", type: "button", children: "PNG" }), _jsx("button", { onClick: exportCsv, title: "Download CSV", className: "ui-export-btn", type: "button", children: "CSV" })] }));
}
