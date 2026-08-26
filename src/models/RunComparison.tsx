import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

export interface ComparisonRun {
  id: string
  config: {
    model_type?: string
    table?: string
    target?: string
    features?: string[]
    task?: string
    test_size?: number
  }
  result?: {
    task?: "regression" | "classification"
    metrics?: Record<string, number | undefined>
    feature_importance?: Array<{ feature: string; importance: number }>
  }
}

const TOOLTIP_STYLE = {
  background: "var(--surface-2)",
  border: "1px solid var(--border-strong)",
  borderRadius: 6,
  itemStyle: { color: "var(--text)", fontSize: 12 },
} as const

const LOWER_BETTER = new Set(["RMSE", "MAE"])

function metricsRows(task: string, m?: Record<string, number | undefined>) {
  if (task === "regression") {
    return [
      { label: "R²", val: m?.r2 },
      { label: "RMSE", val: m?.rmse },
      { label: "MAE", val: m?.mae },
    ]
  }
  return [
    { label: "Accuracy", val: m?.accuracy },
    { label: "F1", val: m?.f1 },
    { label: "Precision", val: m?.precision },
    { label: "Recall", val: m?.recall },
  ]
}

function shortLabel(run: ComparisonRun): string {
  return `${(run.config.model_type ?? "").replace(/_/g, " ")} / ${run.config.target ?? "?"}`
}

function MetricRow({ label, a, b }: { label: string; a?: number; b?: number }) {
  if (a == null && b == null) return null
  const better =
    a != null && b != null
      ? LOWER_BETTER.has(label)
        ? a < b
          ? "a"
          : a > b
            ? "b"
            : null
        : a > b
          ? "a"
          : a < b
            ? "b"
            : null
      : null

  return (
    <tr>
      <td className="ui-sb-note">{label}</td>
      <td className={better === "a" ? "ui-compare-best" : ""}>{a != null ? a.toFixed(4) : "—"}</td>
      <td className={better === "b" ? "ui-compare-best" : ""}>{b != null ? b.toFixed(4) : "—"}</td>
    </tr>
  )
}

function FeatureCompare({ runA, runB }: { runA: ComparisonRun; runB: ComparisonRun }) {
  const fiA = Object.fromEntries((runA.result?.feature_importance ?? []).map((f) => [f.feature, f.importance]))
  const fiB = Object.fromEntries((runB.result?.feature_importance ?? []).map((f) => [f.feature, f.importance]))
  const allFeatures = Array.from(new Set([...Object.keys(fiA), ...Object.keys(fiB)]))
  if (allFeatures.length === 0) return null

  const data = allFeatures
    .map((f) => ({ feature: f, A: +(fiA[f] ?? 0).toFixed(4), B: +(fiB[f] ?? 0).toFixed(4) }))
    .sort((x, y) => y.A + y.B - (x.A + x.B))
    .slice(0, 12)

  return (
    <div className="ui-card ui-mlcard">
      <p className="ui-chart-title">Feature importance comparison</p>
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 28)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 10 }} />
          <YAxis type="category" dataKey="feature" tick={{ fill: "var(--text-2)", fontSize: 11 }} width={110} />
          <Tooltip contentStyle={{ ...TOOLTIP_STYLE }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
          <Bar dataKey="A" name={shortLabel(runA).slice(0, 20)} fill="var(--brand)" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="B" name={shortLabel(runB).slice(0, 20)} fill="var(--series-2)" radius={[0, 3, 3, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface Props {
  runA?: ComparisonRun | null
  runB?: ComparisonRun | null
  onClose?: () => void
}

/** Side-by-side diff of two training runs: config differences highlighted,
    best metric in green per row, feature importances overlaid. */
export function RunComparison({ runA, runB, onClose }: Props) {
  if (!runA || !runB) return null
  const task = runA.result?.task ?? runB.result?.task ?? "regression"
  const rowsA = metricsRows(task, runA.result?.metrics)
  const rowsB = metricsRows(task, runB.result?.metrics)

  function configRow(label: string, fn: (c: ComparisonRun["config"]) => string) {
    return { label, a: fn(runA!.config), b: fn(runB!.config), diff: fn(runA!.config) !== fn(runB!.config) }
  }

  const configRows = [
    configRow("Model", (c) => (c.model_type ?? "").replace(/_/g, " ")),
    configRow("Table", (c) => c.table || "—"),
    configRow("Target", (c) => c.target || "—"),
    configRow("Features", (c) => `${(c.features ?? []).length} cols`),
    configRow("Task", (c) => c.task || "—"),
    configRow("Test size", (c) => `${(((c.test_size ?? 0.2) * 100)).toFixed(0)}%`),
  ]

  return (
    <div className="ui-mlstack">
      <div className="ui-mlhead">
        <h3 className="ui-expandable-title">Run comparison</h3>
        {onClose && (
          <button type="button" onClick={onClose} className="ui-sb-note">
            ✕ Close
          </button>
        )}
      </div>

      <div className="ui-card ui-mlcard">
        <p className="ui-chart-title">Configuration</p>
        <table className="ui-comparetable">
          <thead>
            <tr>
              <th />
              <th>Run A</th>
              <th>Run B</th>
            </tr>
          </thead>
          <tbody>
            {configRows.map(({ label, a, b, diff }) => (
              <tr key={label} style={{ background: diff ? "color-mix(in srgb, var(--warn) 8%, transparent)" : undefined }}>
                <td>{label}</td>
                <td>{String(a)}</td>
                <td>{String(b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ui-card ui-mlcard">
        <p className="ui-chart-title">
          Metrics <span className="ui-mlsoft">(green = better)</span>
        </p>
        <table className="ui-comparetable">
          <thead>
            <tr>
              <th />
              <th>Run A</th>
              <th>Run B</th>
            </tr>
          </thead>
          <tbody>
            {rowsA.map(({ label }, i) => (
              <MetricRow key={label} label={label} a={rowsA[i].val} b={rowsB[i]?.val} />
            ))}
          </tbody>
        </table>
      </div>

      <FeatureCompare runA={runA} runB={runB} />
    </div>
  )
}
