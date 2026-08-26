import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
// PALETTE is intentionally static — categorical identity must stay stable
// across re-renders and theme changes.
const PALETTE = [
    // The same eight tokens the rest of the kit charts with, then round again —
    // this was a second, independent twelve-colour literal palette sharing six
    // values with the first, which is two palettes to keep in step and no way to
    // theme either.
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)",
    "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)",
    "var(--chart-1)", "var(--chart-3)", "var(--chart-5)", "var(--chart-7)",
];
// Read kit tokens from CSS variables so the chart matches light/dark instead
// of rendering as an island.
function getThemeColors() {
    const s = getComputedStyle(document.documentElement);
    const v = (name) => s.getPropertyValue(name).trim();
    return {
        bg: "transparent",
        elevated: v("--surface-2"),
        border: v("--border-strong"),
        primary: v("--text"),
        secondary: v("--text-2"),
        muted: v("--muted"),
    };
}
const CHART_TYPES = [
    { id: "bar", label: "Bar" },
    { id: "horizontal_bar", label: "H. Bar" },
    { id: "line", label: "Line" },
    { id: "area", label: "Area" },
    { id: "scatter", label: "Scatter" },
    { id: "histogram", label: "Distribution" },
];
const AGG_FNS = {
    avg: (vs) => vs.reduce((a, b) => a + b, 0) / vs.length,
    sum: (vs) => vs.reduce((a, b) => a + b, 0),
    count: (vs) => vs.length,
    min: (vs) => Math.min(...vs),
    max: (vs) => Math.max(...vs),
};
const ID_RE = /^(player_id|fg_id|mlbam_id|game_pk|game_id|team_id|batter_id|pitcher_id)$/i;
function fmtNum(v) {
    if (v == null || !Number.isFinite(Number(v)))
        return String(v ?? "");
    const n = Number(v);
    if (Number.isInteger(n))
        return n.toLocaleString();
    const abs = Math.abs(n);
    if (abs >= 100)
        return n.toFixed(1);
    if (abs >= 10)
        return n.toFixed(2);
    if (abs >= 0.001)
        return n.toFixed(3);
    return n.toPrecision(4);
}
function axisLabel(v) {
    if (typeof v === "string")
        return v.length > 14 ? v.slice(0, 13) + "…" : v;
    const n = Number(v);
    if (!Number.isFinite(n))
        return String(v);
    if (Math.abs(n) >= 1000)
        return (n / 1000).toFixed(1) + "k";
    if (Math.abs(n) >= 10)
        return n.toFixed(0);
    if (Math.abs(n) >= 1)
        return n.toFixed(1);
    return n.toFixed(2);
}
function detectColTypes(columns, rows) {
    return Object.fromEntries(columns.map((col, idx) => {
        const vals = rows.map((r) => r[idx]).filter((v) => v != null && v !== "");
        if (!vals.length)
            return [col, "text"];
        const numRatio = vals.filter((v) => Number.isFinite(Number(v))).length / vals.length;
        return [col, numRatio > 0.7 ? "numeric" : "text"];
    }));
}
function toObjects(columns, rows) {
    return rows.map((row) => Object.fromEntries(columns.map((col, i) => {
        const v = row[i];
        if (v == null)
            return [col, null];
        const n = Number(v);
        return [col, Number.isFinite(n) ? n : v];
    })));
}
function autoSuggest(columns, colTypes, objects) {
    const numeric = columns.filter((c) => colTypes[c] === "numeric" && !ID_RE.test(c));
    const text = columns.filter((c) => colTypes[c] === "text" && !ID_RE.test(c));
    const seasonCol = columns.find((c) => /^(season|year)$/i.test(c) && new Set(objects.map((r) => r[c])).size >= 2);
    const nameCol = text.find((c) => /^(name|player|team|league|position)$/i.test(c));
    if (seasonCol && numeric.length >= 1)
        return { type: "line", x: seasonCol, y: [numeric[0]], colorBy: nameCol ?? null };
    if (text.length >= 1 && numeric.length >= 1)
        return { type: "horizontal_bar", x: text[0], y: [numeric[0]], colorBy: null };
    if (numeric.length >= 2)
        return { type: "scatter", x: numeric[0], y: [numeric[1]], colorBy: text[0] ?? null };
    if (numeric.length >= 1)
        return { type: "histogram", x: numeric[0], y: ["count"], colorBy: null };
    return { type: "bar", x: columns[0], y: [columns[1] ?? columns[0]], colorBy: null };
}
function groupData(objects, xCol, yCols, aggKey) {
    const fn = AGG_FNS[aggKey];
    const groups = new Map();
    objects.forEach((row) => {
        const key = row[xCol];
        if (key == null)
            return;
        const k = String(key);
        if (!groups.has(k))
            groups.set(k, Object.fromEntries(yCols.map((y) => [y, []])));
        const bucket = groups.get(k);
        yCols.forEach((y) => {
            const n = Number(row[y]);
            if (Number.isFinite(n))
                bucket[y].push(n);
        });
    });
    return [...groups.entries()].map(([key, yMap]) => ({
        [xCol]: key,
        ...Object.fromEntries(yCols.map((y) => [y, yMap[y].length ? fn(yMap[y]) : null])),
    }));
}
function groupDataMultiSeries(objects, xCol, yCol, colorByCol, aggKey, maxSeries = 8) {
    const fn = AGG_FNS[aggKey];
    const series = [...new Set(objects.map((r) => r[colorByCol]).filter((v) => v != null))].slice(0, maxSeries).map(String);
    const xGroups = new Map();
    objects.forEach((row) => {
        const xVal = row[xCol];
        const cat = row[colorByCol];
        if (xVal == null || cat == null || !series.includes(String(cat)))
            return;
        const k = String(xVal);
        if (!xGroups.has(k))
            xGroups.set(k, Object.fromEntries(series.map((s) => [s, []])));
        const n = Number(row[yCol]);
        if (Number.isFinite(n))
            xGroups.get(k)[String(cat)].push(n);
    });
    return [...xGroups.entries()]
        .map(([xVal, catMap]) => ({
        [xCol]: xVal,
        ...Object.fromEntries(series.map((s) => [s, catMap[s].length ? fn(catMap[s]) : null])),
    }))
        .sort((a, b) => {
        const an = Number(a[xCol]), bn = Number(b[xCol]);
        return Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(a[xCol]).localeCompare(String(b[xCol]));
    });
}
function sortByX(data, xCol) {
    return [...data].sort((a, b) => {
        const an = Number(a[xCol]), bn = Number(b[xCol]);
        return Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(a[xCol]).localeCompare(String(b[xCol]));
    });
}
function histogramBuckets(objects, col, bins = 24) {
    const vals = objects.map((r) => Number(r[col])).filter(Number.isFinite);
    if (!vals.length)
        return [];
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const step = (hi - lo) / bins || 1;
    const counts = Array(bins).fill(0);
    vals.forEach((v) => { counts[Math.min(Math.floor((v - lo) / step), bins - 1)]++; });
    return counts.map((count, i) => ({ bucket: (lo + i * step).toFixed(2), count }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOption({ chartType, chartData, xCol, yCols, colorBySeries, objects, limit, colorBy, scatterColorMap, T }) {
    const AXIS_SHARED = {
        axisLine: { lineStyle: { color: T.border } },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: T.border, opacity: 0.6 } },
    };
    function valueAxis(name) {
        return {
            ...AXIS_SHARED,
            type: "value",
            name,
            nameLocation: "middle",
            nameGap: 48,
            nameTextStyle: { color: T.muted, fontSize: 11 },
            axisLabel: { color: T.muted, fontSize: 11, formatter: axisLabel },
        };
    }
    function categoryAxis(data, name, extra = {}) {
        return {
            ...AXIS_SHARED,
            type: "category",
            data,
            name,
            axisLabel: { color: T.muted, fontSize: 11, ...extra },
            splitLine: { show: false },
        };
    }
    function tooltipBase(trigger = "axis") {
        return {
            trigger,
            backgroundColor: T.elevated,
            borderColor: T.border,
            textStyle: { color: T.primary, fontSize: 11 },
            appendToBody: true,
            // A neutral drop shadow, which is the one colour that is the same in
            // both themes — a shadow is an absence of light, not a hue, and every
            // --shadow-* token in the kit is likewise black at an alpha.
            extraCssText: "box-shadow:0 4px 24px rgba(0,0,0,0.3);border-radius:8px;",
        };
    }
    const ZOOM_SLIDER = {
        type: "slider",
        height: 18,
        bottom: 4,
        borderColor: T.border,
        backgroundColor: T.elevated,
        fillerColor: "color-mix(in srgb, var(--chart-1) 12%, transparent)",
        handleStyle: { color: "var(--chart-1)", borderColor: "var(--chart-1)" },
        moveHandleStyle: { color: "var(--chart-1)" },
        selectedDataBackground: {
            lineStyle: { color: "var(--chart-1)" },
            areaStyle: { color: "color-mix(in srgb, var(--chart-1) 8%, transparent)" },
        },
        dataBackground: {
            lineStyle: { color: T.border },
            areaStyle: { color: T.elevated },
        },
        textStyle: { color: T.muted },
    };
    function tooltipFmt() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (params) => {
            const arr = Array.isArray(params) ? params : [params];
            const name = arr[0]?.axisValueLabel ?? arr[0]?.name ?? "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows = arr
                .filter((p) => p.value != null)
                .map((p) => {
                const val = Array.isArray(p.value) ? p.value[1] : p.value;
                return `<div style="display:flex;justify-content:space-between;gap:16px">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:5px"></span><span style="color:${T.secondary}">${p.seriesName}</span></span>
            <strong style="color:${T.primary};font-family:monospace">${fmtNum(val)}</strong>
          </div>`;
            });
            return `<div style="color:${T.primary};font-weight:600;margin-bottom:5px">${name}</div>${rows.join("")}`;
        };
    }
    const showLegend = !!(colorBySeries || yCols.length > 1);
    const hasSlider = chartType === "line" || chartType === "area";
    const gridTop = showLegend ? 40 : 16;
    const gridBottom = hasSlider ? 56 : 12;
    const baseOpt = {
        backgroundColor: T.bg,
        color: PALETTE,
        textStyle: { color: T.secondary, fontSize: 11 },
        legend: showLegend
            ? {
                top: 6, type: "scroll",
                textStyle: { color: T.secondary, fontSize: 11 },
                icon: "circle", itemWidth: 8, itemHeight: 8,
                inactiveColor: T.muted,
                pageTextStyle: { color: T.muted },
                pageIconColor: T.secondary,
            }
            : undefined,
        grid: { left: 12, right: 12, top: gridTop, bottom: gridBottom, containLabel: true },
        animation: true,
        animationDuration: 400,
    };
    if (chartType === "histogram") {
        return {
            ...baseOpt,
            tooltip: { ...tooltipBase(), formatter: tooltipFmt() },
            xAxis: categoryAxis(chartData.map((d) => d.bucket), xCol, { rotate: 30, fontSize: 10 }),
            yAxis: valueAxis("count"),
            series: [{
                    name: "count", type: "bar",
                    data: chartData.map((d) => d.count),
                    barWidth: "98%",
                    itemStyle: { color: PALETTE[0], borderRadius: [3, 3, 0, 0] },
                }],
            dataZoom: [{ type: "inside" }],
        };
    }
    if (chartType === "scatter") {
        const yCol = yCols[0];
        const slice = objects.slice(0, limit);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scatterTooltip = (params) => {
            const [x, y] = params.value;
            return `<div style="font-weight:600;margin-bottom:4px;color:${T.primary}">${params.seriesName}</div>
        <div style="color:${T.secondary}">${xCol}: <strong style="color:${T.primary};font-family:monospace">${fmtNum(x)}</strong></div>
        <div style="color:${T.secondary}">${yCol}: <strong style="color:${T.primary};font-family:monospace">${fmtNum(y)}</strong></div>`;
        };
        return {
            ...baseOpt,
            tooltip: { ...tooltipBase("item"), formatter: scatterTooltip },
            xAxis: { ...valueAxis(xCol), nameGap: 32 },
            yAxis: valueAxis(yCol),
            series: scatterColorMap
                ? Object.entries(scatterColorMap).map(([cat, color]) => ({
                    name: String(cat), type: "scatter",
                    data: slice.filter((r) => r[colorBy] === cat).map((r) => [r[xCol], r[yCol]]),
                    symbolSize: 7,
                    itemStyle: { color, opacity: 0.85 },
                }))
                : [{
                        name: `${xCol} vs ${yCol}`, type: "scatter",
                        data: slice.map((r) => [r[xCol], r[yCol]]),
                        symbolSize: 7,
                        itemStyle: { opacity: 0.8 },
                    }],
            dataZoom: [
                { type: "inside", xAxisIndex: 0 },
                { type: "inside", yAxisIndex: 0 },
            ],
        };
    }
    if (chartType === "horizontal_bar") {
        const slice = [...chartData].sort((a, b) => (b[yCols[0]] ?? -Infinity) - (a[yCols[0]] ?? -Infinity)).slice(0, 40);
        return {
            ...baseOpt,
            tooltip: { ...tooltipBase(), formatter: tooltipFmt() },
            xAxis: { ...valueAxis(""), splitLine: { lineStyle: { color: T.border, opacity: 0.6 } }, axisLine: { lineStyle: { color: T.border } }, axisLabel: { color: T.muted, fontSize: 11, formatter: axisLabel } },
            yAxis: {
                ...AXIS_SHARED,
                type: "category",
                data: slice.map((r) => r[xCol]),
                inverse: false,
                axisLabel: { color: T.secondary, fontSize: 11, width: 100, overflow: "truncate" },
                splitLine: { show: false },
            },
            series: yCols.map((y, si) => ({
                name: y, type: "bar",
                data: slice.map((r) => r[y]),
                itemStyle: { color: PALETTE[si % PALETTE.length], borderRadius: [0, 3, 3, 0], opacity: 0.85 },
                barMaxWidth: 24,
            })),
        };
    }
    if (chartType === "bar") {
        const slice = [...chartData].sort((a, b) => (b[yCols[0]] ?? -Infinity) - (a[yCols[0]] ?? -Infinity)).slice(0, 30);
        const rotate = slice.length > 10 ? 30 : 0;
        return {
            ...baseOpt,
            tooltip: { ...tooltipBase(), formatter: tooltipFmt() },
            xAxis: categoryAxis(slice.map((r) => r[xCol]), "", { rotate, fontSize: rotate ? 10 : 11 }),
            yAxis: { ...valueAxis(""), axisLabel: { color: T.muted, fontSize: 11, formatter: axisLabel } },
            series: yCols.map((y, i) => ({
                name: y, type: "bar",
                data: slice.map((r) => r[y]),
                itemStyle: { color: PALETTE[i % PALETTE.length], borderRadius: [3, 3, 0, 0] },
                barMaxWidth: 36,
            })),
        };
    }
    const isArea = chartType === "area";
    const lineStyle = { width: 2 };
    const dot = { symbol: "none" };
    if (colorBySeries) {
        return {
            ...baseOpt,
            tooltip: { ...tooltipBase(), formatter: tooltipFmt() },
            xAxis: categoryAxis(chartData.map((r) => r[xCol]), ""),
            yAxis: { ...valueAxis(""), axisLabel: { color: T.muted, fontSize: 11, formatter: axisLabel } },
            series: colorBySeries.map((cat, i) => ({
                name: String(cat), type: "line",
                data: chartData.map((r) => r[cat] ?? null),
                lineStyle: { ...lineStyle, color: PALETTE[i % PALETTE.length] },
                itemStyle: { color: PALETTE[i % PALETTE.length] },
                areaStyle: isArea ? { color: PALETTE[i % PALETTE.length], opacity: 0.08 } : undefined,
                connectNulls: true,
                ...dot,
            })),
            dataZoom: [{ type: "inside" }, { ...ZOOM_SLIDER }],
        };
    }
    return {
        ...baseOpt,
        tooltip: { ...tooltipBase(), formatter: tooltipFmt() },
        xAxis: categoryAxis(chartData.map((r) => r[xCol]), ""),
        yAxis: { ...valueAxis(""), axisLabel: { color: T.muted, fontSize: 11, formatter: axisLabel } },
        series: yCols.map((y, i) => ({
            name: y, type: "line",
            data: chartData.map((r) => r[y] ?? null),
            lineStyle: { ...lineStyle, color: PALETTE[i % PALETTE.length] },
            itemStyle: { color: PALETTE[i % PALETTE.length] },
            areaStyle: isArea ? { color: PALETTE[i % PALETTE.length], opacity: 0.08 } : undefined,
            ...dot,
        })),
        dataZoom: [{ type: "inside" }, { ...ZOOM_SLIDER }],
    };
}
/** Auto-visualizing explorer for tabular query results: picks a shape from
    column types, then lets you switch types, axes, grouping and aggregation. */
export function SandboxChart({ columns, rows }) {
    const colTypes = useMemo(() => detectColTypes(columns, rows), [columns, rows]);
    const objects = useMemo(() => toObjects(columns, rows), [columns, rows]);
    const numericCols = useMemo(() => columns.filter((c) => colTypes[c] === "numeric" && !ID_RE.test(c)), [columns, colTypes]);
    const textCols = useMemo(() => columns.filter((c) => colTypes[c] === "text" && !ID_RE.test(c)), [columns, colTypes]);
    const initial = useMemo(() => autoSuggest(columns, colTypes, objects), [columns, colTypes, objects]);
    const [chartType, setChartType] = useState(initial.type);
    const [xCol, setXCol] = useState(initial.x);
    const [yCols, setYCols] = useState(initial.y);
    const [colorBy, setColorBy] = useState(initial.colorBy);
    const [agg, setAgg] = useState("avg");
    const [limit, setLimit] = useState(200);
    const isScatter = chartType === "scatter";
    const isHist = chartType === "histogram";
    const isLine = chartType === "line" || chartType === "area";
    const colorBySeries = useMemo(() => {
        if (!isLine || !colorBy)
            return null;
        const vals = [...new Set(objects.slice(0, limit).map((r) => r[colorBy]).filter((v) => v != null))];
        return vals.length <= 8 ? vals : null;
    }, [isLine, colorBy, objects, limit]);
    const scatterColorMap = useMemo(() => {
        if (!isScatter || !colorBy)
            return null;
        const vals = [...new Set(objects.slice(0, limit).map((r) => r[colorBy]).filter((v) => v != null))];
        return Object.fromEntries(vals.slice(0, 12).map((v, i) => [v, PALETTE[i % PALETTE.length]]));
    }, [isScatter, colorBy, objects, limit]);
    const chartData = useMemo(() => {
        const slice = objects.slice(0, limit);
        if (isHist)
            return histogramBuckets(slice, xCol);
        if (isScatter)
            return slice;
        if (isLine && colorBySeries && colorBy != null)
            return groupDataMultiSeries(slice, xCol, yCols[0], colorBy, agg);
        const grouped = groupData(slice, xCol, yCols, agg);
        return isLine ? sortByX(grouped, xCol) : grouped;
    }, [objects, chartType, xCol, yCols, agg, limit, colorBySeries, colorBy, isScatter, isHist, isLine, colorBy]);
    const option = useMemo(() => buildOption({ chartType, chartData, xCol, yCols, colorBySeries, objects, limit, colorBy, scatterColorMap, T: getThemeColors() }), [chartType, chartData, xCol, yCols, colorBySeries, objects, limit, colorBy, scatterColorMap]);
    function toggleY(col) {
        setYCols((prev) => prev.includes(col)
            ? prev.length > 1
                ? prev.filter((c) => c !== col)
                : prev
            : isScatter
                ? [col]
                : [...prev, col]);
    }
    function switchType(id) {
        setChartType(id);
        const needsNumX = id === "scatter" || id === "histogram";
        if (needsNumX && colTypes[xCol] !== "numeric" && numericCols.length)
            setXCol(numericCols[0]);
        if (needsNumX)
            setYCols([yCols.find((c) => numericCols.includes(c)) ?? numericCols[0] ?? yCols[0]]);
    }
    const xOptions = isScatter || isHist ? numericCols : [...textCols, ...numericCols];
    return (_jsxs("div", { className: "ui-sb-chart", children: [_jsx("div", { className: "ui-sb-typetabs", children: CHART_TYPES.map((ct) => (_jsx("button", { type: "button", onClick: () => switchType(ct.id), className: `ui-sb-typebtn ${chartType === ct.id ? "ui-sb-typebtn--on" : ""}`, children: ct.label }, ct.id))) }), _jsxs("div", { className: "ui-sb-config", children: [_jsxs("div", { children: [_jsx("p", { className: "ui-sb-label", children: isHist ? "Column" : "X Axis" }), _jsx("select", { value: xCol, onChange: (e) => setXCol(e.target.value), className: "ui-field ui-sb-select", children: xOptions.map((c) => (_jsx("option", { value: c, children: c }, c))) })] }), !isHist && (_jsxs("div", { children: [_jsx("p", { className: "ui-sb-label", children: "Y Axis" }), _jsxs("div", { className: "ui-sb-ylist", children: [numericCols.map((c) => (_jsx("button", { type: "button", onClick: () => toggleY(c), className: `ui-sb-pillbtn ${yCols.includes(c) ? "ui-sb-pillbtn--on" : ""}`, children: c }, c))), !numericCols.length && _jsx("span", { className: "ui-sb-note", children: "No numeric columns" })] })] })), (isScatter || isLine) && textCols.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "ui-sb-label", children: "Color by" }), _jsxs("select", { value: colorBy ?? "", onChange: (e) => setColorBy(e.target.value || null), className: "ui-field ui-sb-select", children: [_jsx("option", { value: "", children: "None" }), textCols.map((c) => (_jsx("option", { value: c, children: c }, c)))] }), isLine && colorBy && !colorBySeries && _jsx("p", { className: "ui-sb-warn", children: "> 8 values \u2014 showing aggregate" })] })), !isScatter && !isHist && (_jsxs("div", { children: [_jsx("p", { className: "ui-sb-label", children: "Aggregate" }), _jsx("select", { value: agg, onChange: (e) => setAgg(e.target.value), className: "ui-field ui-sb-select", children: ["avg", "sum", "count", "min", "max"].map((a) => (_jsx("option", { value: a, children: a }, a))) })] })), _jsxs("div", { children: [_jsx("p", { className: "ui-sb-label", children: "Rows" }), _jsx("select", { value: limit, onChange: (e) => setLimit(Number(e.target.value)), className: "ui-field ui-sb-select", children: [50, 100, 200, 500].map((n) => (_jsx("option", { value: n, children: n }, n))) })] })] }), chartData?.length ? (_jsx(ReactECharts, { option: option, style: { height: 400 }, notMerge: true, opts: { renderer: "canvas" } })) : (_jsx("div", { className: "ui-chart-empty", children: "No data to visualize" }))] }));
}
