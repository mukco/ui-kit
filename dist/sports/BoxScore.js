import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
import { Tabs } from "../primitives/Tabs";
function HeadRow({ label, columns }) {
    return (_jsxs("tr", { children: [_jsx("th", { className: "ui-th ui-boxscore-player", children: label }), columns.map((c) => _jsx("th", { className: "ui-th ui-boxscore-num", children: c.label }, c.key))] }));
}
function Row({ row, columns }) {
    return (_jsxs("tr", { className: cn("ui-tr", row.dim && "ui-boxscore-row--dim"), children: [_jsx("td", { className: "ui-td ui-boxscore-player", children: _jsxs("span", { className: "ui-boxscore-who", children: [row.player, row.note != null && _jsx("span", { className: "ui-boxscore-note", children: row.note })] }) }), columns.map((c) => (_jsx("td", { className: cn("ui-td ui-boxscore-num", c.strong && "ui-boxscore-num--strong", c.muted && "ui-boxscore-num--muted"), children: row.cells[c.key] ?? "" }, c.key)))] }));
}
function Section({ section }) {
    const groups = section.groups ?? [{ label: section.title, rows: section.rows ?? [] }];
    if (!groups.some((g) => g.rows.length))
        return null;
    return (_jsx("div", { className: "ui-tablescroll ui-boxscore-scroll", children: _jsxs("table", { className: "ui-table ui-boxscore-table", children: [groups.map((g) => (_jsxs("tbody", { children: [_jsx(HeadRow, { label: g.label, columns: section.columns }), g.rows.map((r) => _jsx(Row, { row: r, columns: section.columns }, r.id))] }, g.label))), section.totals && (_jsx("tbody", { children: _jsxs("tr", { className: "ui-tr ui-boxscore-totals", children: [_jsx("td", { className: "ui-td ui-boxscore-player", children: "Team" }), section.columns.map((c) => _jsx("td", { className: "ui-td ui-boxscore-num", children: section.totals?.[c.key] ?? "" }, c.key))] }) }))] }) }));
}
export function BoxScore({ teams, initial, className }) {
    const [active, setActive] = useState(initial ?? teams[0]?.key);
    const team = teams.find((t) => t.key === active) ?? teams[0];
    if (!team)
        return null;
    return (_jsxs("div", { className: cn("ui-boxscore", className), children: [teams.length > 1 && _jsx(Tabs, { tabs: teams.map((t) => ({ id: t.key, label: t.label })), active: team.key, onChange: setActive }), team.sections.map((s) => _jsx(Section, { section: s }, s.title)), team.footnote != null && _jsx("div", { className: "ui-boxscore-foot", children: team.footnote })] }));
}
