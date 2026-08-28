import { memo, useEffect, useMemo, useRef, useState, type HTMLAttributes } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { sql as sqlLang } from "@codemirror/lang-sql"
import { EditorView, keymap } from "@codemirror/view"
import { Prec } from "@codemirror/state"
import { oneDark } from "@codemirror/theme-one-dark"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "../cn"
import { SandboxChart } from "./SandboxChart"
import { SandboxPivot } from "./SandboxPivot"

export interface CellRecord {
  id: string
  type?: "sql" | "md"
  sql: string
  title?: string
}

export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  rowCount: number
  runtimeMs: number
  truncated?: boolean
}

interface Props {
  cell: CellRecord
  index: number
  /** Run SQL and return the result set — the app owns the database call. */
  onRun: (sql: string) => Promise<QueryResult>
  onUpdateSql: (sql: string) => void
  onUpdateTitle?: (title: string) => void
  onDelete?: () => void
  onFocus?: () => void
  /** Optional CodeMirror schema for completions: {table: {column: type}} */
  schema?: Record<string, Record<string, string>>
  /** Table names for completion. Was hardcoded to [], so a consumer with a
      schema still got no table completions. */
  tables?: string[]
  /** Told about a failed query, for a page-level error surface. */
  onError?: (message: string) => void
  /**
   * Offer "ask the assistant about this error" under a failure, with a prompt
   * the app then routes wherever its assistant lives.
   */
  askAssistant?: (prompt: string) => void
  /** Render the first "name"-ish column as a link when a paired id column exists. */
  renderNameLink?: (name: string, id: unknown) => React.ReactNode
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
}

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
const BRAND_OVERRIDE = EditorView.theme(
  {
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
  },
  { dark: false },
)

const BASE_EXTENSIONS = [oneDark, BRAND_OVERRIDE]

const ID_COLS = new Set(["player_id", "fg_id", "mlbam_id", "game_pk", "game_id", "team_id", "batter_id", "pitcher_id"])

function fmtCell(v: unknown, col: string): string | null {
  if (v == null) return null
  if (typeof v !== "number") return String(v)
  if (!Number.isFinite(v)) return String(v)
  if (Number.isInteger(v)) return ID_COLS.has(col) ? String(v) : v.toLocaleString()
  const abs = Math.abs(v)
  if (abs >= 100) return v.toFixed(1)
  if (abs >= 10) return v.toFixed(2)
  if (abs >= 0.001) return v.toFixed(3)
  return v.toPrecision(4)
}

function fmtSummary(v: number): string {
  if (!Number.isFinite(v)) return String(v)
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + "k"
  if (Math.abs(v) >= 10) return v.toFixed(1)
  return v.toFixed(3).replace(/\.?0+$/, "")
}

function SandboxCellInner({
  cell,
  index,
  onRun,
  tables,
  onError,
  askAssistant,
  onUpdateSql,
  onUpdateTitle,
  onDelete,
  onFocus,
  schema,
  renderNameLink,
  dragHandleProps,
}: Props) {
  const [viewMode, setViewMode] = useState<"table" | "chart" | "pivot">("table")
  const [showSummary, setShowSummary] = useState(false)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [collapsed, setCollapsed] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [mdEditing, setMdEditing] = useState(!cell.sql)
  const [running, setRunning] = useState(false)

  const [localSql, setLocalSql] = useState(() => cell.sql)
  const titleRef = useRef<HTMLInputElement>(null)
  const mdRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  // Sync in when replaced externally (e.g. assistant injection into a new cell)
  const prevCellId = useRef(cell.id)
  useEffect(() => {
    if (cell.id !== prevCellId.current) {
      setLocalSql(cell.sql)
      prevCellId.current = cell.id
    }
  }, [cell.id, cell.sql])

  const isMd = cell.type === "md"

  const sqlExtensions = useMemo(() => {
    const sqlExt = sqlLang({ schema: (schema ?? {}) as never, tables: (tables ?? []) as never, upperCaseKeywords: true })
    const runKey = Prec.highest(keymap.of([{ key: "Mod-Enter", run: () => { void run(); return true } }]))
    return [...BASE_EXTENSIONS, sqlExt, runKey]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, tables])

  async function run() {
    if (!localSql.trim()) return
    setRunning(true)
    setError(null)
    try {
      const data = await onRun(localSql)
      setResult(data)
      setSortKey(data.columns[0])
      setSortDir("desc")
      setViewMode("table")
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      setError(e)
      onError?.(e.message)
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus()
  }, [editingTitle])
  useEffect(() => {
    if (mdEditing) mdRef.current?.focus()
  }, [mdEditing])

  const sortedRows = useMemo(() => {
    if (!result?.rows?.length || !sortKey) return result?.rows ?? []
    const idx = result.columns.indexOf(sortKey)
    if (idx < 0) return result.rows
    return [...result.rows].sort((a: unknown[], b: unknown[]) => {
      const av = a[idx], bv = b[idx]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const an = Number(av), bn = Number(bv)
      const cmp = Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [result, sortKey, sortDir])

  function handleSort(col: string) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(col)
      setSortDir("desc")
    }
  }

  function defaultRenderCell(value: unknown, col: string): React.ReactNode {
    const nameIdx = result?.columns?.indexOf("name") ?? -1
    const pidIdx = result?.columns?.indexOf("player_id") ?? -1
    if (col === "name" && pidIdx >= 0 && renderNameLink) {
      const rowIdx = sortedRows.findIndex((r: unknown[]) => r[nameIdx] === value)
      const id = rowIdx >= 0 ? sortedRows[rowIdx][pidIdx] : null
      if (id != null) return renderNameLink(String(value), id)
    }
    if (typeof value === "number") return <span className="ui-mono">{fmtCell(value, col)}</span>
    return String(value)
  }

  return (
    <div className="ui-card ui-sb-cell" tabIndex={-1} onFocus={onFocus}>
      {/* Header */}
      <div className="ui-sb-cellhead">
        <span className="ui-sb-cellindex">[{index + 1}]</span>
        <span className={cn("ui-sb-celltype", isMd ? "ui-sb-celltype--md" : "ui-sb-celltype--sql")}>{isMd ? "MD" : "SQL"}</span>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={cell.title ?? ""}
            onChange={(e) => onUpdateTitle?.(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
            placeholder="Cell title…"
            className="ui-sb-titleinput"
          />
        ) : (
          <button type="button" onClick={() => setEditingTitle(true)} className="ui-sb-title">
            {cell.title || <span className="ui-sb-title-empty">Untitled cell</span>}
          </button>
        )}

        <div className="ui-sb-cellactions">
          <button type="button" title="Drag to reorder" className="ui-sb-iconbtn" {...(dragHandleProps ?? {})}>
            ⠿
          </button>
          {onDelete && (
            <button type="button" onClick={onDelete} title="Delete cell" className="ui-sb-iconbtn ui-sb-iconbtn--danger">
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand" : "Collapse"}
            className="ui-sb-iconbtn"
            style={{ transform: collapsed ? "rotate(-90deg)" : undefined }}
          >
            ▾
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Markdown */}
          {isMd &&
            (mdEditing ? (
              <div className="ui-sb-mdedit">
                <textarea
                  ref={mdRef}
                  value={localSql}
                  onChange={(e) => setLocalSql(e.target.value)}
                  onBlur={() => onUpdateSql(localSql)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault()
                      onUpdateSql(localSql)
                      setMdEditing(false)
                    }
                  }}
                  placeholder="Write markdown here… (Cmd+Enter to preview)"
                  rows={6}
                  className="ui-field ui-sb-textarea"
                />
                <button type="button" className="ui-sb-runbtn" onClick={() => { onUpdateSql(localSql); setMdEditing(false) }}>
                  Done
                </button>
              </div>
            ) : (
              <div className="ui-sb-mdview" onClick={() => setMdEditing(true)}>
                {localSql.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{localSql}</ReactMarkdown>
                ) : (
                  <p className="ui-sb-placeholder">Click to add markdown…</p>
                )}
                <button type="button" className="ui-sb-editbtn" onClick={() => setMdEditing(true)}>
                  Edit
                </button>
              </div>
            ))}

          {/* SQL editor */}
          {!isMd && (
            <div className="ui-sb-editorwrap">
              <CodeMirror
                value={localSql}
                onChange={setLocalSql}
                onBlur={() => onUpdateSql(localSql)}
                theme="none"
                extensions={sqlExtensions}
                minHeight="80px"
                placeholder="SELECT * FROM my_table LIMIT 50"
                basicSetup={{
                  lineNumbers: false,
                  foldGutter: false,
                  autocompletion: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  highlightActiveLine: true,
                  tabSize: 2,
                }}
                className="ui-sb-editor"
              />
              <button
                type="button"
                onClick={() => void run()}
                disabled={running || !localSql.trim()}
                className="ui-sb-runbtn ui-sb-runbtn--floating"
              >
                {running ? "Running…" : "▶ Run"}
              </button>
            </div>
          )}

          {/* Error */}
          {!isMd && error && (
            <div className="ui-sb-error">
              <span className="ui-mono">{error.message}</span>
              {askAssistant && (
                <button
                  type="button"
                  className="ui-sb-errorask"
                  onClick={() =>
                    askAssistant(
                      `Error in SQL Sandbox:\n\`\`\`\n${error.message}\n\`\`\`\nQuery:\n\`\`\`sql\n${localSql}\n\`\`\`\nHow do I fix it?`,
                    )
                  }
                >
                  Ask the assistant
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {!isMd && result && (
            <div className="ui-sb-results">
              <div className="ui-sb-resultbar">
                <span className="ui-sb-meta">
                  <strong>{result.rowCount}</strong> rows · <strong>{result.runtimeMs}ms</strong>
                  {result.truncated && <em> · truncated</em>}
                </span>

                <div className="ui-sb-viewtabs">
                  {(["table", "chart", "pivot"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setViewMode(t)} className={cn("ui-sb-viewtab", viewMode === t && "ui-sb-viewtab--on")}>
                      {t}
                    </button>
                  ))}
                </div>

                {viewMode === "table" && (
                  <button type="button" onClick={() => setShowSummary((s) => !s)} className={cn("ui-sb-sumbtn", showSummary && "ui-sb-sumbtn--on")}>
                    ∑ Summary
                  </button>
                )}
              </div>

              {viewMode === "table" && (
                <BasicTableInCell
                  columns={result.columns}
                  rows={sortedRows}
                  allRows={result.rows}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  showSummary={showSummary}
                  renderCell={renderNameLink ? defaultRenderCell : undefined}
                />
              )}
              {viewMode === "chart" && <SandboxChart key={result.columns.join("|")} columns={result.columns} rows={result.rows} />}
              {viewMode === "pivot" && <SandboxPivot key={result.columns.join("|")} columns={result.columns} rows={result.rows} />}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Sorting is owned by the cell (it drives both header arrows and row order),
// so this thin wrapper reuses BasicTable's rendering with external sort state.
function BasicTableInCell({ columns, rows, allRows, sortKey, sortDir, onSort, showSummary, renderCell }: {
  columns: string[]
  rows: unknown[][]
  allRows: unknown[][]
  sortKey: string | null
  sortDir: "asc" | "desc"
  onSort: (c: string) => void
  showSummary: boolean
  renderCell?: (value: unknown, col: string, rowIndex: number) => React.ReactNode
}) {
  const summary = useMemo(() => {
    if (!showSummary) return null
    return columns.map((_, colIdx): { kind: "text"; text: string } | { kind: "num"; avg: number; min: number; max: number } => {
      const vals = allRows.map((r) => r[colIdx]).filter((v) => v != null && Number.isFinite(Number(v))).map(Number)
      if (!vals.length) return { kind: "text", text: `${allRows.filter((r) => r[colIdx] != null).length} non-null` }
      const sum = vals.reduce((a, b) => a + b, 0)
      const avg = sum / vals.length
      return { kind: "num", avg, min: Math.min(...vals), max: Math.max(...vals) }
    })
  }, [columns, allRows, showSummary])

  return (
    <div className="ui-btable-wrap" style={{ maxHeight: 480 }}>
      <table className="ui-btable">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} onClick={() => onSort(c)}>
                <span className="ui-th-inner">{c}{sortKey === c && <span className="ui-sort-arrow">{sortDir === "asc" ? "↑" : "↓"}</span>}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, i) => (
                <td key={`${ri}-${i}`}>
                  {cell == null ? (
                    <span className="ui-btable-null">—</span>
                  ) : (
                    renderCell?.(cell, columns[i], ri) ?? <span className="ui-mono">{String(cell)}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {summary && (
          <tfoot>
            <tr>
              {summary.map((s, i) => (
                <td key={i}>
                  {s.kind === "num" ? (
                    <span className="ui-btable-sumstat">
                      <span>avg {fmtSummary(s.avg)}</span>
                      <span>{fmtSummary(s.min)} – {fmtSummary(s.max)}</span>
                    </span>
                  ) : (
                    <span className="ui-btable-count">{s.text}</span>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export const SandboxCell = memo(SandboxCellInner)
