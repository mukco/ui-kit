import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { cn } from "../cn";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
function ramp(pct) {
    if (pct >= 0.85)
        return "var(--stat-elite)";
    if (pct >= 0.65)
        return "var(--stat-great)";
    if (pct >= 0.4)
        return "var(--stat-avg)";
    if (pct >= 0.2)
        return "var(--stat-below)";
    return "var(--stat-poor)";
}
/** Value pill colored against its column distribution. */
export function HeatPill({ children, color }) {
    if (!color)
        return _jsx("span", { className: "ui-mono ui-td", children: children });
    return (_jsx("span", { className: "ui-heatpill", style: { color, background: `color-mix(in oklch, ${color} 12%, transparent)` }, children: children }));
}
/**
 * Column-driven sortable table with distribution heat pills and optional
 * click-to-expand rows. Sorting lives inside the component. Wide tables
 * scroll horizontally on phones.
 */
export function DataTable({ data, columns, rowKey, renderExpanded, empty = "No data available.", error, onRetry, maxHeight, className, }) {
    const [sort, setSort] = useState(null);
    const [expandedKey, setExpandedKey] = useState(null);
    const rows = useMemo(() => {
        if (!data?.length)
            return [];
        if (!sort)
            return data;
        const dir = sort.dir === "asc" ? 1 : -1;
        return [...data].sort((a, b) => {
            const av = Number(a[sort.key]);
            const bv = Number(b[sort.key]);
            if (Number.isFinite(av) && Number.isFinite(bv))
                return (av - bv) * dir;
            return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * dir;
        });
    }, [data, sort]);
    // Per-column min/max for heat coloring.
    const ranges = useMemo(() => {
        const map = {};
        if (!data?.length)
            return map;
        for (const col of columns) {
            if (col.lowIsBetter === undefined)
                continue; // no heat flag → plain column
            const nums = data.map((r) => Number(r[col.key])).filter(Number.isFinite);
            if (!nums.length)
                continue;
            map[col.key] = { min: Math.min(...nums), max: Math.max(...nums) };
        }
        return map;
    }, [data, columns]);
    function toggleSort(key) {
        setSort((s) => s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" });
    }
    // Checked before the empty case: a failed fetch also leaves `data` empty, and
    // rendering "no rows" over a request that never succeeded tells the reader
    // the opposite of what happened.
    if (error != null) {
        return (_jsx("div", { className: cn("ui-card", className), children: _jsx(ErrorState, { onRetry: onRetry, children: error }) }));
    }
    if (!data?.length) {
        return (_jsx("div", { className: cn("ui-card", className), children: _jsx(EmptyState, { icon: "\uD83D\uDCCA", children: empty }) }));
    }
    function heatColor(col, raw) {
        const range = ranges[col.key];
        const n = Number(raw);
        if (!range || !Number.isFinite(n))
            return null;
        let pct = range.max === range.min ? 1 : (n - range.min) / (range.max - range.min);
        if (col.lowIsBetter)
            pct = 1 - pct;
        return ramp(pct);
    }
    return (_jsx("div", { className: cn("ui-tablecard", className), children: _jsx("div", { className: "ui-tablescroll", style: maxHeight ? { maxHeight, overflowY: "auto" } : undefined, children: _jsxs("table", { className: cn("ui-table", maxHeight && "ui-table--sticky"), children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "ui-th ui-th-num", children: "#" }), columns.map((col) => {
                                    const sorted = sort?.key === col.key;
                                    return (_jsx("th", { className: cn("ui-th", col.align === "right" && "ui-th--right"), "aria-sort": sorted ? (sort.dir === "asc" ? "ascending" : "descending") : "none", 
                                        // role="button" + tabIndex + onKeyDown, not a real <button>:
                                        // col.label is an arbitrary ReactNode specifically so a
                                        // caller can compose a tooltip into it (GlossaryTip renders
                                        // its own <button>), and a button cannot contain a button —
                                        // browsers silently close the outer one, splitting the cell
                                        // in the real DOM while React still thinks it's intact,
                                        // which is what made this header's sort occasionally take
                                        // two clicks to register. tabIndex/onKeyDown restore the
                                        // keyboard support a real button used to provide for free.
                                        role: "button", tabIndex: 0, onClick: () => toggleSort(col.key), onKeyDown: (e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                toggleSort(col.key);
                                            }
                                        }, children: _jsx("span", { className: "ui-th-sort", children: _jsxs("span", { className: "ui-th-inner", children: [col.label, sorted && (_jsx("span", { className: "ui-sort-arrow", "aria-hidden": "true", children: sort.dir === "asc" ? "↑" : "↓" }))] }) }) }, col.key));
                                })] }) }), _jsx("tbody", { children: rows.map((row, i) => {
                            const k = rowKey ? rowKey(row, i) : String(i);
                            const expandable = !!renderExpanded;
                            const isOpen = expandable && expandedKey === k;
                            return (_jsx(ExpandableRowBody, { index: i, row: row, columns: columns, heatColor: heatColor, expandable: expandable, open: isOpen, onToggle: () => setExpandedKey((cur) => (cur === k ? null : k)), renderExpanded: renderExpanded }, k));
                        }) })] }) }) }));
}
function ExpandableRowBody({ index, row, columns, heatColor, expandable, open, onToggle, renderExpanded, }) {
    const cells = columns.map((col) => {
        const raw = row[col.key];
        if (col.render) {
            return (_jsx("td", { className: cn("ui-td", col.align === "right" && "ui-td--right"), children: col.render(row) }, col.key));
        }
        const shown = raw != null ? (col.fmt ? col.fmt(raw) : String(raw)) : "—";
        const color = heatColor(col, raw);
        if (color) {
            return (_jsx("td", { className: cn("ui-td", col.align === "right" && "ui-td--right"), children: _jsx(HeatPill, { color: color, children: shown }) }, col.key));
        }
        return (_jsx("td", { className: cn("ui-td", col.align === "right" && "ui-td--right"), children: shown }, col.key));
    });
    return (_jsxs(_Fragment, { children: [_jsxs("tr", { className: cn("ui-tr", expandable && "ui-tr--clickable", open && "ui-tr--open"), onClick: expandable ? onToggle : undefined, children: [_jsx("td", { className: "ui-td ui-td-num", children: index + 1 }), cells] }), open && (_jsx("tr", { className: "ui-tr-expanded", children: _jsx("td", { colSpan: columns.length + 1, children: renderExpanded(row) }) }))] }));
}
