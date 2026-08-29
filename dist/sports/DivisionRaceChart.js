import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, } from "recharts";
import { TeamIcon } from "./TeamIcon";
// Team brand colors are tuned for light backgrounds — brighten them so they
// stay legible against the chart's dark-surface tooltip and legend text.
function brightenForDark(hex) {
    if (!hex || hex.length < 7)
        return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const blend = (c) => Math.round(c + (255 - c) * 0.55);
    return `rgb(${blend(r)},${blend(g)},${blend(b)})`;
}
export function DivisionRaceChart({ divisionRace, favTeamId, 
/** Y-axis bounds. Baseball's teams cluster near .500 over a long season, so
    [0.3, 0.7] reads better zoomed in; a shorter season (or a blowout
    division) wants the full [0, 1] so a leader or a winless team is not
    pinned to the axis edge. */
domain = [0.3, 0.7], 
/** How a series point's `date` renders on the x-axis and in the tooltip.
    Identity by default — pass a formatter for a parseable date string
    (e.g. `(d) => format(parseISO(d), 'M/d')`). */
formatLabel = (d) => d, }) {
    if (!divisionRace?.length) {
        return _jsx("div", { className: "ui-race-none", children: "No data" });
    }
    const allDates = [...new Set(divisionRace.flatMap(t => t.series.map(p => p.date)))].sort();
    const withColors = divisionRace.map(t => ({ ...t, displayColor: brightenForDark(t.color) }));
    const filled = withColors.map(team => {
        const byDate = Object.fromEntries(team.series.map(p => [p.date, p.winPct]));
        let last = 0.5;
        return {
            ...team,
            byDate: Object.fromEntries(allDates.map(d => {
                if (byDate[d] !== undefined)
                    last = byDate[d];
                return [d, last];
            })),
        };
    });
    const chartData = allDates.map(date => {
        const pt = { date };
        filled.forEach(t => { pt[`t${t.teamId}`] = t.byDate[date]; });
        return pt;
    });
    const step = Math.max(1, Math.floor(allDates.length / 4));
    const legendSorted = [...filled].sort((a, b) => {
        const aLast = a.series[a.series.length - 1]?.winPct ?? 0;
        const bLast = b.series[b.series.length - 1]?.winPct ?? 0;
        return bLast - aLast;
    });
    // Tick fill comes from the stylesheet so it follows the theme.
    const AXIS_TICK = { fontSize: 9 };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "ui-race-body", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: chartData, margin: { top: 2, right: 4, bottom: 0, left: -28 }, children: [_jsx(XAxis, { dataKey: "date", tickFormatter: (d, i) => (i % step === 0 ? formatLabel(d) : ""), tick: AXIS_TICK, axisLine: false, tickLine: false }), _jsx(YAxis, { domain: domain, tickFormatter: (v) => `${(v * 100).toFixed(0)}%`, tick: AXIS_TICK, axisLine: false, tickLine: false }), _jsx(Tooltip, { content: ({ active, payload, label }) => {
                                    if (!active || !payload?.length)
                                        return null;
                                    const sorted = [...payload].sort((a, b) => b.value - a.value);
                                    const teamById = Object.fromEntries(filled.map(t => [`t${t.teamId}`, t]));
                                    return (_jsxs("div", { className: "ui-race-tip", children: [_jsx("div", { className: "ui-race-tip-date", children: formatLabel(label) }), sorted.map((p) => {
                                                const team = teamById[String(p.dataKey)];
                                                return (_jsxs("div", { className: "ui-race-tip-row", children: [team && _jsx(TeamIcon, { teamId: team.teamId, size: 14, name: team.teamAbbr }), _jsx("span", { className: "ui-race-tip-name", children: team?.teamAbbr }), _jsxs("span", { className: "ui-race-tip-val", children: [(p.value * 100).toFixed(1), "%"] })] }, p.dataKey));
                                            })] }));
                                } }), filled.map(t => (_jsx(Line, { type: "monotone", dataKey: `t${t.teamId}`, name: t.teamAbbr, stroke: t.displayColor, strokeWidth: t.teamId === favTeamId ? 2.5 : 1.5, dot: false, opacity: t.teamId === favTeamId ? 1 : 0.65, strokeDasharray: t.teamId === favTeamId ? undefined : "4 2" }, t.teamId)))] }) }) }), _jsx("div", { className: "ui-race-legend", children: legendSorted.map(t => (_jsxs("div", { className: "ui-race-legend-item", children: [_jsx(TeamIcon, { teamId: t.teamId, size: 14, name: t.teamAbbr }), _jsx("span", { className: "ui-race-legend-abbr", style: { color: t.displayColor, opacity: t.teamId === favTeamId ? 1 : 0.8 }, children: t.teamAbbr })] }, t.teamId))) })] }));
}
