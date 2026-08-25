import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Inline micro line chart — no axes, just the trend shape with gradient
    fill and a last-value dot that colors by direction. */
export function SparklineChart({ data = [], valueKey = "value", color = "var(--brand)", width = 80, height = 28 }) {
    const vals = (data ?? []).map((d) => Number(d[valueKey])).filter(Number.isFinite);
    if (vals.length < 2)
        return null;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const id = `ui-spark-${valueKey}-${width}`;
    function mapY(v) {
        return 2 + (1 - (v - min) / range) * (height - 4);
    }
    const pts = vals.map((v, i) => ({
        x: (i / (vals.length - 1)) * (width - 4) + 2,
        y: mapY(v),
    }));
    const linePts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const fillPts = [`2,${height}`, ...pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`), `${(width - 2).toFixed(1)},${height}`].join(" ");
    const last = pts[pts.length - 1];
    const trendVal = vals[vals.length - 1] - vals[0];
    const dotColor = trendVal >= 0 ? color : "var(--stat-poor)";
    return (_jsxs("svg", { width: width, height: height, viewBox: `0 0 ${width} ${height}`, style: { overflow: "visible", flexShrink: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: id, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.35" }), _jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0.02" })] }) }), _jsx("polygon", { points: fillPts, fill: `url(#${id})` }), _jsx("polyline", { points: linePts, fill: "none", stroke: color, strokeWidth: "1.8", strokeLinejoin: "round", strokeLinecap: "round" }), _jsx("circle", { cx: last.x, cy: last.y, r: "2.5", fill: dotColor })] }));
}
