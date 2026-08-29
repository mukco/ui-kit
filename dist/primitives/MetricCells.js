import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { HelpTip } from "./HelpTip";
export function PercentileBarSmall({ pct }) {
    if (pct == null)
        return null;
    const v = Math.max(0, Math.min(100, Number(pct)));
    const cls = v >= 75 ? "ui-metric-bar--hi" : v >= 50 ? "ui-metric-bar--mid" : v >= 25 ? "ui-metric-bar--warn" : "ui-metric-bar--low";
    return (_jsx("div", { className: "ui-metric-bar", children: _jsx("div", { className: cn("ui-metric-bar-fill", cls), style: { width: `${v}%` } }) }));
}
/**
 * Shared metric-cells strip: value over label, columns separated by vertical rules.
 * Used by both baseball (pts/pPD+/surplus/PAR/market) and football (points/PAR/WOPR/EPA).
 * Fixed-width `align` mode keeps every requested key even when null (muted middot) so columns land at same x.
 * Salary badge (when `salary` present) sits in the middle as a visual divider, like baseball's bb-mc-sal.
 */
export function MetricCells({ metrics, keys, defs, dense = false, compact = false, align = false, showBars = false, showHelp = false, hideSalary = false, trailing = null, }) {
    const opts = {};
    const build = (k) => defs[k]?.(metrics, opts);
    const cells = keys
        .map(build)
        .filter(Boolean)
        .filter((c) => (align ? true : c.value != null));
    const sizeClass = compact ? "ui-metriccell--compact" : "ui-metriccell--normal";
    const salary = metrics.salary;
    if (dense) {
        const salaryCell = (_jsx("div", { className: "ui-metriccell ui-metriccell--dense", children: _jsx("div", { className: "ui-metricval ui-metricval--dense", children: salary ? `$${salary}` : "·" }) }, "salary"));
        const keyCells = keys.map((k) => {
            const c = build(k);
            if (!c)
                return null;
            return (_jsx("div", { className: "ui-metriccell ui-metriccell--dense", title: c.label, children: _jsx("div", { className: cn("ui-metricval ui-metricval--dense", c.value == null ? "ui-metricval--muted" : c.colorClass), children: c.value ?? "·" }) }, c.key));
        });
        const mid = Math.floor(keyCells.length / 2);
        return (_jsx("div", { className: "ui-metriccells ui-metriccells--dense", children: hideSalary ? keyCells : _jsxs(_Fragment, { children: [keyCells.slice(0, mid), salaryCell, keyCells.slice(mid)] }) }));
    }
    const cellW = align ? (compact ? "ui-metriccell--fixed-sm" : "ui-metriccell--fixed") : compact ? "ui-metriccell--flex-sm" : "ui-metriccell--flex";
    const valCls = compact ? "ui-metricval ui-metricval--sm" : "ui-metricval";
    const salaryEl = hideSalary ? null : (_jsx("div", { className: cn("ui-metricsalary", align ? "ui-metricsalary--align" : "ui-metricsalary--row"), children: salary ? _jsxs("span", { className: "ui-salarybadge", children: ["$", salary] }) : null }));
    const rowCells = align ? keys.map((k) => build(k)).filter(Boolean) : cells;
    return (_jsxs("div", { className: "ui-metriccells", children: [salaryEl, rowCells.map((c) => (_jsxs("div", { className: cn("ui-metriccell", cellW, sizeClass), children: [_jsx("div", { className: cn(valCls, c.value == null ? "ui-metricval--muted" : c.colorClass), children: c.value ?? "·" }), _jsxs("div", { className: "ui-metriclabel", children: [c.label, showHelp && c.help && _jsx(HelpTip, { children: c.help })] }), c.sub && !compact && _jsx("div", { className: "ui-metricsub", children: c.sub }), showBars && c.pctile != null && _jsx(PercentileBarSmall, { pct: c.pctile })] }, c.key))), trailing] }));
}
