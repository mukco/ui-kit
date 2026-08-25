import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell, YAxis } from "recharts"
import type { MlRunResult } from "./ModelResults"
import { cn } from "../cn"

export interface MlRun {
  id: string
  created_at: string
  config: {
    model_type?: string
    table?: string
    target?: string
    features?: string[]
  }
  result?: MlRunResult
}

interface Props {
  runs: MlRun[]
  loading?: boolean
  selectedRunId?: string | null
  compareRunId?: string | null
  onLoad: (run: MlRun) => void
  onDelete?: (id: string) => void
  /** "Ask the assistant about this run" affordance; omit to hide. */
  onAsk?: (run: MlRun) => void
  onCompare?: () => void
}

function primaryMetric(run: MlRun): number | null {
  const m = run.result?.metrics ?? {}
  return run.result?.task === "regression" ? (m.r2 ?? null) : (m.accuracy ?? null)
}

function metricColor(val: number | null): string {
  if (val == null) return "var(--muted)"
  if (val >= 0.7) return "var(--brand)"
  if (val >= 0.4) return "#f59e0b"
  return "#ef4444"
}

function shortLabel(run: MlRun): string {
  return `${(run.config.model_type ?? "").replace(/_/g, " ")} · ${run.config.target ?? "?"}`.slice(0, 24)
}

function RunCard({ run, onLoad, onDelete, onAsk, isSelected }: { run: MlRun; onLoad: (run: MlRun) => void; onDelete?: (id: string) => void; onAsk?: (run: MlRun) => void; isSelected: boolean }) {
  const date = new Date(run.created_at)
  const label = `${(run.config.model_type ?? "").replace(/_/g, " ")} · ${run.config.target ?? "?"}`
  const m = run.result?.metrics ?? {}
  const isReg = run.result?.task === "regression"
  const primary = primaryMetric(run)
  const pct = primary != null ? Math.min(100, Math.max(0, primary * 100)) : null

  return (
    <div className={cn("ui-card ui-runcard", isSelected && "ui-runcard--selected")} onClick={() => onLoad(run)}>
      <div className="ui-runcard-head">
        <div className="ui-runcard-titles">
          <p className="ui-runcard-label">{label}</p>
          <p className="ui-sb-note">
            {run.config.table} · {(run.config.features ?? []).length} features
          </p>
          <p className="ui-sb-note">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="ui-runcard-actions">
          {onAsk && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAsk(run)
              }}
              className="ui-iconbtn"
              title="Chat about this run"
            >
              💬
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(run.id)
              }}
              className="ui-iconbtn ui-iconbtn--danger"
              title="Delete run"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="ui-mlchips">
        {isReg ? (
          <>
            {m.r2 != null && <SummaryChip label="R²" val={m.r2.toFixed(3)} />}
            {m.rmse != null && <SummaryChip label="RMSE" val={m.rmse.toFixed(3)} />}
          </>
        ) : (
          <>
            {m.accuracy != null && <SummaryChip label="Acc" val={`${(m.accuracy * 100).toFixed(0)}%`} />}
            {m.f1 != null && <SummaryChip label="F1" val={m.f1.toFixed(3)} />}
          </>
        )}
      </div>
      {pct != null && (
        <div className="ui-bar">
          <div className="ui-bar-fill" style={{ width: `${pct}%`, background: metricColor(primary) }} />
        </div>
      )}
    </div>
  )
}

function SummaryChip({ label, val }: { label: string; val: string }) {
  return (
    <span className="ui-summarychip">
      <span className="ui-sb-note">{label}</span>
      <span className="ui-mono">{val}</span>
    </span>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as { label: string; metricLabel: string; value: number }
  return (
    <div className="ui-tooltip">
      <p className="ui-tooltip-title">{d.label}</p>
      <p className="ui-tooltip-row">
        {d.metricLabel}: <strong>{d.value?.toFixed(3)}</strong>
      </p>
    </div>
  )
}

/** Saved-run browser for an ML builder: mini bar chart of the primary metric
    across recent runs plus clickable run cards. Data comes in via props. */
export function RunHistory({ runs, loading, selectedRunId, compareRunId, onLoad, onDelete, onAsk, onCompare }: Props) {
  if (loading) return <p className="ui-sb-note">Loading runs…</p>
  if (!runs.length) return <p className="ui-sb-note">No saved runs yet. Train a model to start.</p>

  const isReg = runs[0]?.result?.task === "regression"
  const metricLabel = isReg ? "R²" : "Accuracy"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = runs
    .slice(0, 10)
    .map((r) => ({ id: r.id, label: shortLabel(r), value: primaryMetric(r), metricLabel, run: r }))
    .filter((d) => d.value != null)
    .reverse()

  return (
    <div className="ui-runhistory">
      <div className="ui-chart-head">
        <p className="ui-chart-title">Run history ({runs.length})</p>
        {onCompare && runs.length >= 2 && (
          <button type="button" onClick={onCompare} className="ui-insights-regen">
            Compare →
          </button>
        )}
      </div>

      {chartData.length >= 2 && (
        <div style={{ padding: "0 4px 4px" }}>
          <p className="ui-sb-note" style={{ marginBottom: 4 }}>
            {metricLabel} across runs — click a bar to load
          </p>
          <ResponsiveContainer width="100%" height={96}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <BarChart data={chartData as any[]} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "var(--muted)" }} tickCount={3} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]} onClick={(d: any) => d?.run && onLoad(d.run)} style={{ cursor: "pointer" }}>
                {(chartData as Array<{ id: string; value: number | null }>).map((d) => (
                  <Cell key={d.id} fill={metricColor(d.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {runs.map((run) => (
        <RunCard key={run.id} run={run} onLoad={() => onLoad(run)} onDelete={onDelete} onAsk={onAsk} isSelected={run.id === selectedRunId || run.id === compareRunId} />
      ))}
    </div>
  )
}
