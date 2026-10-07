import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TeamIcon } from "./TeamIcon";
const num = (v) => (typeof v === "number" ? v : Number(v));
export function LineScore({ away, home, periods, totals, minPeriods = 0, highlightScoring, dimLoser, compact, logos, className }) {
    const padded = [...periods];
    for (let i = periods.length; i < minPeriods; i++)
        padded.push({ label: String(i + 1) });
    const strong = totals.find((t) => t.strong);
    const lost = (side) => {
        if (!dimLoser || !strong)
            return false;
        const a = num(strong.away), h = num(strong.home);
        if (!Number.isFinite(a) || !Number.isFinite(h) || a === h)
            return false;
        return side === "away" ? a < h : h < a;
    };
    const row = (side, team) => (_jsxs("tr", { className: "ui-tr", children: [_jsx("td", { className: "ui-linescore-team", children: _jsxs("span", { className: "ui-linescore-teamcell", children: [logos && _jsx(TeamIcon, { teamId: team.teamId, name: team.name, size: compact ? 16 : 20 }), _jsx("span", { children: team.name })] }) }), padded.map((p, i) => {
                const v = p[side];
                const scored = highlightScoring && v != null && num(v) > 0;
                return (_jsx("td", { className: `ui-linescore-cell${scored ? " ui-linescore-cell--scored" : ""}${p.current ? " ui-linescore-cell--current" : ""}`, children: v ?? "·" }, i));
            }), _jsx("td", { className: "ui-linescore-gap", "aria-hidden": "true" }), totals.map((t) => (_jsx("td", { className: `ui-linescore-total${t.strong ? " ui-linescore-total--strong" : ""}${t.strong && lost(side) ? " ui-linescore-total--lost" : ""}`, children: t[side] ?? "–" }, t.label)))] }));
    return (_jsx("div", { className: `ui-tablescroll ui-linescore-wrap${className ? ` ${className}` : ""}`, children: _jsxs("table", { className: `ui-table ui-linescore${compact ? " ui-linescore--compact" : ""}`, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "ui-th ui-linescore-teamhead" }), padded.map((p, i) => _jsx("th", { className: `ui-th${p.current ? " ui-linescore-head--current" : ""}`, children: p.label }, i)), _jsx("th", { className: "ui-th ui-linescore-gap", "aria-hidden": "true" }), totals.map((t) => _jsx("th", { className: "ui-th", children: t.label }, t.label))] }) }), _jsxs("tbody", { children: [row("away", away), row("home", home)] })] }) }));
}
