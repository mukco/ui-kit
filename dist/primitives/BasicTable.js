import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { cn } from "../cn";
import { HelpTip } from "./HelpTip";
function fmtNum(v) {
    if (!Number.isFinite(v))
        return String(v);
    if (Number.isInteger(v))
        return v.toLocaleString();
    const abs = Math.abs(v);
    if (abs >= 100)
        return v.toFixed(1);
    if (abs >= 10)
        return v.toFixed(2);
    if (abs >= 0.001)
        return v.toFixed(3);
    return v.toPrecision(4);
}
function fmtSummary(v) {
    if (!Number.isFinite(v))
        return String(v);
    if (Math.abs(v) >= 1000)
        return (v / 1000).toFixed(1) + "k";
    if (Math.abs(v) >= 10)
        return v.toFixed(1);
    return v.toFixed(3).replace(/\.?0+$/, "");
}
/** The basic data grid: plain columns+rows, sortable headers, sticky head,
    optional stats footer. The simpler sibling of DataTable — no heat pills,
    no object rows; exactly what raw query results want. */
export function BasicTable({ columns, rows, showSummary = false, maxHeight = 480, renderCell, className }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("desc");
    const sortedRows = useMemo(() => {
        if (!rows.length || !sortKey)
            return rows;
        const idx = columns.indexOf(sortKey);
        if (idx < 0)
            return rows;
        return [...rows].sort((a, b) => {
            const av = a[idx], bv = b[idx];
            if (av == null && bv == null)
                return 0;
            if (av == null)
                return 1;
            if (bv == null)
                return -1;
            const an = Number(av), bn = Number(bv);
            const cmp = Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(av).localeCompare(String(bv));
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [rows, columns, sortKey, sortDir]);
    function handleSort(col) {
        if (sortKey === col)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(col);
            setSortDir("desc");
        }
    }
    const summary = useMemo(() => {
        if (!showSummary)
            return null;
        return columns.map((_, colIdx) => {
            const vals = rows.map((r) => r[colIdx]).filter((v) => v != null && Number.isFinite(Number(v))).map(Number);
            if (!vals.length)
                return { type: "text", count: rows.filter((r) => r[colIdx] != null).length };
            const sum = vals.reduce((a, b) => a + b, 0);
            return { type: "numeric", avg: sum / vals.length, min: Math.min(...vals), max: Math.max(...vals) };
        });
    }, [columns, rows, showSummary]);
    return (_jsx("div", { className: cn("ui-btable-wrap", className), style: { maxHeight }, children: _jsxs("table", { className: "ui-btable", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((c) => (_jsx("th", { onClick: () => handleSort(c), children: _jsxs("span", { className: "ui-th-inner", children: [c, _jsx(HelpTip, { children: `Sort by ${c}` }), sortKey === c && _jsx("span", { className: "ui-sort-arrow", children: sortDir === "asc" ? "↑" : "↓" })] }) }, c))) }) }), _jsx("tbody", { children: sortedRows.map((row, ri) => (_jsx("tr", { children: row.map((cell, i) => (_jsx("td", { children: cell == null ? (_jsx("span", { className: "ui-btable-null", children: "\u2014" })) : (renderCell?.(cell, columns[i], ri) ?? (_jsx("span", { className: "ui-mono", children: typeof cell === "number" ? fmtNum(cell) : String(cell) }))) }, `${ri}-${i}`))) }, ri))) }), summary && (_jsx("tfoot", { children: _jsx("tr", { children: summary.map((s, i) => (_jsx("td", { children: s.type === "numeric" ? (_jsxs("span", { className: "ui-btable-sumstat", children: [_jsxs("span", { children: ["avg ", fmtSummary(s.avg)] }), _jsxs("span", { children: [fmtSummary(s.min), " \u2013 ", fmtSummary(s.max)] })] })) : (_jsxs("span", { className: "ui-btable-count", children: [s.count, " non-null"] })) }, i))) }) }))] }) }));
}
