import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** Map a 0–100 percentile to the stat-ramp tokens. */
function rampColor(pct) {
    if (pct == null)
        return null;
    if (pct >= 85)
        return "var(--stat-elite)";
    if (pct >= 65)
        return "var(--stat-great)";
    if (pct >= 40)
        return "var(--stat-avg)";
    if (pct >= 20)
        return "var(--stat-below)";
    return "var(--stat-poor)";
}
export function PercentileBar({ percentile, className }) {
    if (percentile == null)
        return null;
    const color = rampColor(percentile);
    return (_jsx("div", { className: cn("ui-bar", className), children: _jsx("div", { className: "ui-bar-fill", style: { width: `${Math.max(2, percentile)}%`, background: color ?? undefined } }) }));
}
/**
 * A single stat value with optional percentile pill + bar, progress bar,
 * or projection comparison strip.
 */
export function StatCard({ label, value, subtitle, percentile, progress, comparison, neutral = false, invert = false, className }) {
    const displayValue = value ?? "—";
    const displayPct = invert && percentile != null ? 100 - percentile : (percentile ?? null);
    const pctColor = neutral ? "var(--muted)" : rampColor(displayPct);
    const showPercentile = displayPct != null && pctColor != null;
    const progressPct = progress && Number(progress.target) > 0
        ? Math.max(0, Math.min(100, (Number(progress.current) / Number(progress.target)) * 100))
        : null;
    return (_jsxs("div", { className: cn("ui-card ui-stat", className), children: [_jsxs("div", { className: "ui-stat-head", children: [_jsx("span", { className: "ui-stat-label", children: label }), showPercentile && (_jsxs("span", { className: "ui-stat-pill", style: { color: pctColor, background: `color-mix(in oklch, ${pctColor} 14%, transparent)` }, title: "Percentile among qualified peers", children: [displayPct, "%"] }))] }), _jsxs("div", { className: "ui-stat-value-row", children: [_jsx("span", { className: "ui-stat-value", children: displayValue }), subtitle && _jsx("span", { className: "ui-stat-sub", children: subtitle })] }), showPercentile && _jsx(PercentileBar, { percentile: displayPct }), progressPct != null && progress && (_jsxs("div", { className: "ui-stat-foot", children: [_jsxs("div", { className: "ui-stat-foot-row", children: [progress.label ? _jsx("span", { children: progress.label }) : _jsx("span", {}), _jsxs("span", { className: "ui-mono", children: [progress.current, " / ", progress.target] })] }), _jsx("div", { className: "ui-bar", children: _jsx("div", { className: "ui-bar-fill", style: { width: `${progressPct}%`, background: "color-mix(in srgb, var(--brand) 60%, transparent)" } }) })] })), comparison && (_jsxs("div", { className: "ui-stat-foot", style: { display: "flex", justifyContent: "space-between", fontSize: 11 }, children: [_jsx("span", { style: { color: "var(--muted)" }, children: comparison.projectedLabel }), _jsx("span", { style: { fontWeight: 600, color: comparison.color }, children: comparison.status })] }))] }));
}
/**
 * Compact horizontal stat display for tables and lists.
 *
 * `tone` exists because a row of counts is usually one interesting number and
 * several zeroes — "Workers 8 · Ready 0 · Running 0 · Failed 3" — and rendering
 * all four identically means the panel reporting three dead jobs looks like the
 * panel reporting none. The caller decides which number is news; nothing here
 * guesses, because "high is bad" is true of failures and false of workers.
 */
export function InlineStatRow({ stats, }) {
    return (_jsx("div", { className: "ui-inline-stats", children: stats.map(({ label, value, tone }) => (_jsxs("div", { className: cn("ui-inline-stat", tone && `ui-inline-stat--${tone}`), children: [_jsx("span", { className: "ui-inline-stat-label", children: label }), _jsx("span", { className: "ui-inline-stat-value", children: value ?? "—" })] }, label))) }));
}
