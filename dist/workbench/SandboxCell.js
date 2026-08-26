import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../cn";
import { SandboxChart } from "./SandboxChart";
import { SandboxPivot } from "./SandboxPivot";
/**
 * The editor, wearing the app's own colours.
 *
 * This hard-coded #0F1117 — a near-black — so in light mode the editor was a
 * black slab inside a white card, and no consuming app could do anything
 * about it, because the values were literals rather than tokens. The one-dark
 * base still supplies the syntax highlighting, which is a code-reading
 * convention and reasonably stays as it is; what changes is the chrome around
 * it, which belongs to the page.
 *
 * `dark: false` because the theme now follows whatever --surface-2 resolves
 * to; asserting darkness here would have CodeMirror pick dark defaults for
 * everything this block does not set.
 */
const BRAND_OVERRIDE = EditorView.theme({
    "&": { backgroundColor: "var(--surface-2)", color: "var(--text)" },
    ".cm-content": { caretColor: "var(--brand)" },
    ".cm-cursor": { borderLeftColor: "var(--brand)" },
    ".cm-selectionBackground": {
        background: "color-mix(in srgb, var(--brand) 16%, transparent) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
        background: "color-mix(in srgb, var(--brand) 22%, transparent) !important",
    },
    ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--text) 6%, transparent)" },
    ".cm-gutters": {
        backgroundColor: "var(--surface-2)",
        color: "var(--muted)",
        borderRight: "1px solid var(--border)",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "color-mix(in srgb, var(--text) 6%, transparent)",
    },
}, { dark: false });
const BASE_EXTENSIONS = [oneDark, BRAND_OVERRIDE];
const ID_COLS = new Set(["player_id", "fg_id", "mlbam_id", "game_pk", "game_id", "team_id", "batter_id", "pitcher_id"]);
function fmtCell(v, col) {
    if (v == null)
        return null;
    if (typeof v !== "number")
        return String(v);
    if (!Number.isFinite(v))
        return String(v);
    if (Number.isInteger(v))
        return ID_COLS.has(col) ? String(v) : v.toLocaleString();
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
function SandboxCellInner({ cell, index, onRun, onUpdateSql, onUpdateTitle, onDelete, onFocus, schema, renderNameLink, dragHandleProps, }) {
    const [viewMode, setViewMode] = useState("table");
    const [showSummary, setShowSummary] = useState(false);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("desc");
    const [collapsed, setCollapsed] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [mdEditing, setMdEditing] = useState(!cell.sql);
    const [running, setRunning] = useState(false);
    const [localSql, setLocalSql] = useState(() => cell.sql);
    const titleRef = useRef(null);
    const mdRef = useRef(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    // Sync in when replaced externally (e.g. assistant injection into a new cell)
    const prevCellId = useRef(cell.id);
    useEffect(() => {
        if (cell.id !== prevCellId.current) {
            setLocalSql(cell.sql);
            prevCellId.current = cell.id;
        }
    }, [cell.id, cell.sql]);
    const isMd = cell.type === "md";
    const sqlExtensions = useMemo(() => {
        const sqlExt = sqlLang({ schema: (schema ?? {}), tables: [], upperCaseKeywords: true });
        const runKey = Prec.highest(keymap.of([{ key: "Mod-Enter", run: () => { void run(); return true; } }]));
        return [...BASE_EXTENSIONS, sqlExt, runKey];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schema]);
    async function run() {
        if (!localSql.trim())
            return;
        setRunning(true);
        setError(null);
        try {
            const data = await onRun(localSql);
            setResult(data);
            setSortKey(data.columns[0]);
            setSortDir("desc");
            setViewMode("table");
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setRunning(false);
        }
    }
    useEffect(() => {
        if (editingTitle)
            titleRef.current?.focus();
    }, [editingTitle]);
    useEffect(() => {
        if (mdEditing)
            mdRef.current?.focus();
    }, [mdEditing]);
    const sortedRows = useMemo(() => {
        if (!result?.rows?.length || !sortKey)
            return result?.rows ?? [];
        const idx = result.columns.indexOf(sortKey);
        if (idx < 0)
            return result.rows;
        return [...result.rows].sort((a, b) => {
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
    }, [result, sortKey, sortDir]);
    function handleSort(col) {
        if (sortKey === col)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortKey(col);
            setSortDir("desc");
        }
    }
    function defaultRenderCell(value, col) {
        const nameIdx = result?.columns?.indexOf("name") ?? -1;
        const pidIdx = result?.columns?.indexOf("player_id") ?? -1;
        if (col === "name" && pidIdx >= 0 && renderNameLink) {
            const rowIdx = sortedRows.findIndex((r) => r[nameIdx] === value);
            const id = rowIdx >= 0 ? sortedRows[rowIdx][pidIdx] : null;
            if (id != null)
                return renderNameLink(String(value), id);
        }
        if (typeof value === "number")
            return _jsx("span", { className: "ui-mono", children: fmtCell(value, col) });
        return String(value);
    }
    return (_jsxs("div", { className: "ui-card ui-sb-cell", tabIndex: -1, onFocus: onFocus, children: [_jsxs("div", { className: "ui-sb-cellhead", children: [_jsxs("span", { className: "ui-sb-cellindex", children: ["[", index + 1, "]"] }), _jsx("span", { className: cn("ui-sb-celltype", isMd ? "ui-sb-celltype--md" : "ui-sb-celltype--sql"), children: isMd ? "MD" : "SQL" }), editingTitle ? (_jsx("input", { ref: titleRef, value: cell.title ?? "", onChange: (e) => onUpdateTitle?.(e.target.value), onBlur: () => setEditingTitle(false), onKeyDown: (e) => e.key === "Enter" && setEditingTitle(false), placeholder: "Cell title\u2026", className: "ui-sb-titleinput" })) : (_jsx("button", { type: "button", onClick: () => setEditingTitle(true), className: "ui-sb-title", children: cell.title || _jsx("span", { className: "ui-sb-title-empty", children: "Untitled cell" }) })), _jsxs("div", { className: "ui-sb-cellactions", children: [_jsx("button", { type: "button", title: "Drag to reorder", className: "ui-sb-iconbtn", ...(dragHandleProps ?? {}), children: "\u283F" }), onDelete && (_jsx("button", { type: "button", onClick: onDelete, title: "Delete cell", className: "ui-sb-iconbtn ui-sb-iconbtn--danger", children: "\u2715" })), _jsx("button", { type: "button", onClick: () => setCollapsed((c) => !c), title: collapsed ? "Expand" : "Collapse", className: "ui-sb-iconbtn", style: { transform: collapsed ? "rotate(-90deg)" : undefined }, children: "\u25BE" })] })] }), !collapsed && (_jsxs(_Fragment, { children: [isMd &&
                        (mdEditing ? (_jsxs("div", { className: "ui-sb-mdedit", children: [_jsx("textarea", { ref: mdRef, value: localSql, onChange: (e) => setLocalSql(e.target.value), onBlur: () => onUpdateSql(localSql), onKeyDown: (e) => {
                                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                            e.preventDefault();
                                            onUpdateSql(localSql);
                                            setMdEditing(false);
                                        }
                                    }, placeholder: "Write markdown here\u2026 (Cmd+Enter to preview)", rows: 6, className: "ui-field ui-sb-textarea" }), _jsx("button", { type: "button", className: "ui-sb-runbtn", onClick: () => { onUpdateSql(localSql); setMdEditing(false); }, children: "Done" })] })) : (_jsxs("div", { className: "ui-sb-mdview", onClick: () => setMdEditing(true), children: [localSql.trim() ? (_jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: localSql })) : (_jsx("p", { className: "ui-sb-placeholder", children: "Click to add markdown\u2026" })), _jsx("button", { type: "button", className: "ui-sb-editbtn", onClick: () => setMdEditing(true), children: "Edit" })] }))), !isMd && (_jsxs("div", { className: "ui-sb-editorwrap", children: [_jsx(CodeMirror, { value: localSql, onChange: setLocalSql, onBlur: () => onUpdateSql(localSql), theme: "none", extensions: sqlExtensions, minHeight: "80px", placeholder: "SELECT * FROM my_table LIMIT 50", basicSetup: {
                                    lineNumbers: false,
                                    foldGutter: false,
                                    autocompletion: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    highlightActiveLine: true,
                                    tabSize: 2,
                                }, className: "ui-sb-editor" }), _jsx("button", { type: "button", onClick: () => void run(), disabled: running || !localSql.trim(), className: "ui-sb-runbtn ui-sb-runbtn--floating", children: running ? "Running…" : "▶ Run" })] })), !isMd && error && (_jsx("div", { className: "ui-sb-error", children: _jsx("span", { className: "ui-mono", children: error.message }) })), !isMd && result && (_jsxs("div", { className: "ui-sb-results", children: [_jsxs("div", { className: "ui-sb-resultbar", children: [_jsxs("span", { className: "ui-sb-meta", children: [_jsx("strong", { children: result.rowCount }), " rows \u00B7 ", _jsxs("strong", { children: [result.runtimeMs, "ms"] }), result.truncated && _jsx("em", { children: " \u00B7 truncated" })] }), _jsx("div", { className: "ui-sb-viewtabs", children: ["table", "chart", "pivot"].map((t) => (_jsx("button", { type: "button", onClick: () => setViewMode(t), className: cn("ui-sb-viewtab", viewMode === t && "ui-sb-viewtab--on"), children: t }, t))) }), viewMode === "table" && (_jsx("button", { type: "button", onClick: () => setShowSummary((s) => !s), className: cn("ui-sb-sumbtn", showSummary && "ui-sb-sumbtn--on"), children: "\u2211 Summary" }))] }), viewMode === "table" && (_jsx(BasicTableInCell, { columns: result.columns, rows: sortedRows, allRows: result.rows, sortKey: sortKey, sortDir: sortDir, onSort: handleSort, showSummary: showSummary, renderCell: renderNameLink ? defaultRenderCell : undefined })), viewMode === "chart" && _jsx(SandboxChart, { columns: result.columns, rows: result.rows }, result.columns.join("|")), viewMode === "pivot" && _jsx(SandboxPivot, { columns: result.columns, rows: result.rows }, result.columns.join("|"))] }))] }))] }));
}
// Sorting is owned by the cell (it drives both header arrows and row order),
// so this thin wrapper reuses BasicTable's rendering with external sort state.
function BasicTableInCell({ columns, rows, allRows, sortKey, sortDir, onSort, showSummary, renderCell }) {
    const summary = useMemo(() => {
        if (!showSummary)
            return null;
        return columns.map((_, colIdx) => {
            const vals = allRows.map((r) => r[colIdx]).filter((v) => v != null && Number.isFinite(Number(v))).map(Number);
            if (!vals.length)
                return { kind: "text", text: `${allRows.filter((r) => r[colIdx] != null).length} non-null` };
            const sum = vals.reduce((a, b) => a + b, 0);
            const avg = sum / vals.length;
            return { kind: "num", avg, min: Math.min(...vals), max: Math.max(...vals) };
        });
    }, [columns, allRows, showSummary]);
    return (_jsx("div", { className: "ui-btable-wrap", style: { maxHeight: 480 }, children: _jsxs("table", { className: "ui-btable", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((c) => (_jsx("th", { onClick: () => onSort(c), children: _jsxs("span", { className: "ui-th-inner", children: [c, sortKey === c && _jsx("span", { className: "ui-sort-arrow", children: sortDir === "asc" ? "↑" : "↓" })] }) }, c))) }) }), _jsx("tbody", { children: rows.map((row, ri) => (_jsx("tr", { children: row.map((cell, i) => (_jsx("td", { children: cell == null ? (_jsx("span", { className: "ui-btable-null", children: "\u2014" })) : (renderCell?.(cell, columns[i], ri) ?? _jsx("span", { className: "ui-mono", children: String(cell) })) }, `${ri}-${i}`))) }, ri))) }), summary && (_jsx("tfoot", { children: _jsx("tr", { children: summary.map((s, i) => (_jsx("td", { children: s.kind === "num" ? (_jsxs("span", { className: "ui-btable-sumstat", children: [_jsxs("span", { children: ["avg ", fmtSummary(s.avg)] }), _jsxs("span", { children: [fmtSummary(s.min), " \u2013 ", fmtSummary(s.max)] })] })) : (_jsx("span", { className: "ui-btable-count", children: s.text })) }, i))) }) }))] }) }));
}
export const SandboxCell = memo(SandboxCellInner);
