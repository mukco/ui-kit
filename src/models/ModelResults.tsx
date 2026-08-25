import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { PredActualChart } from "./PredActualChart"
import { ClassBreakdownChart } from "./ClassBreakdownChart"
import { GlossaryTip } from "../primitives/GlossaryTip"
import { ML_GLOSSARY } from "./glossary"

const MUTED = "var(--muted)"
const BORDER = "var(--border)"
const BRAND = "var(--brand)"

const TOOLTIP_STYLE = {
  background: "var(--surface-2)",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  itemStyle: { color: "var(--text)", fontSize: 12 },
} as const

export interface FeatureImportance {
  feature: string
  importance: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MlRunResult {
  model_type: string
  task: "regression" | "classification"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics: any
  confusion_matrix?: number[][]
  confusion_labels?: string[]
  class_breakdown?: React.ComponentProps<typeof ClassBreakdownChart>["classBreakdown"]
  test_predictions?: { y_true: number[]; y_pred: number[]; sampled?: boolean }
  feature_importance?: FeatureImportance[]
  loss_history?: number[]
  parameter_count?: number
  architecture?: string
  train_samples?: number
  test_samples?: number
  training_time_ms?: number
  target?: string
}

function MetricCard({ label, value, hintKey }: { label: string; value: React.ReactNode; hintKey?: string }) {
  return (
    <div className="ui-metriccard">
      <div className="ui-metriccard-label">
        <p>{label}</p>
        {hintKey && <GlossaryTip hint={ML_GLOSSARY[hintKey]} />}
      </div>
      <p className="ui-metriccard-value">{value}</p>
    </div>
  )
}

function SummaryChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="ui-summarychip">
      <span className="ui-sb-note">{label}</span>
      <span className="ui-summarychip-value">{value}</span>
    </span>
  )
}

/** The full training-result readout: summary chips, metrics with hints,
    loss curve, feature importance, pred-vs-actual or per-class breakdown,
    and the confusion matrix. */
export function ModelResults({ results }: { results: MlRunResult }) {
  const {
    model_type,
    task,
    metrics,
    confusion_matrix,
    confusion_labels,
    class_breakdown,
    test_predictions,
    feature_importance,
    loss_history,
    parameter_count,
    architecture,
    train_samples,
    test_samples,
    training_time_ms,
    target,
  } = results

  const isClassification = task === "classification"
  const lossData = loss_history?.map((loss, i) => ({ epoch: i + 1, loss })) ?? []
  const topFeatures = (feature_importance ?? []).slice(0, 12)
  const importanceData = topFeatures.map((f) => ({ name: f.feature, value: f.importance }))

  return (
    <div className="ui-mlstack">
      <div className="ui-mlchips">
        <SummaryChip label="Model" value={model_type.replace(/_/g, " ")} />
        <SummaryChip label="Task" value={task} />
        {train_samples != null && <SummaryChip label="Train" value={`${train_samples} rows`} />}
        {test_samples != null && <SummaryChip label="Test" value={`${test_samples} rows`} />}
        {training_time_ms != null && <SummaryChip label="Time" value={`${(training_time_ms / 1000).toFixed(1)}s`} />}
        {parameter_count != null && <SummaryChip label="Parameters" value={parameter_count.toLocaleString()} />}
      </div>

      {architecture && (
        <div className="ui-card ui-mlcard">
          <p className="ui-sb-note">Architecture</p>
          <p className="ui-arch-string">{architecture}</p>
        </div>
      )}

      <div className="ui-card ui-mlcard">
        <p className="ui-chart-title">Metrics</p>
        {isClassification ? (
          <div className="ui-metricgrid ui-metricgrid--2">
            <MetricCard label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} hintKey="accuracy" />
            <MetricCard label="F1 Score" value={metrics.f1?.toFixed(3)} hintKey="f1" />
            <MetricCard label="Precision" value={metrics.precision?.toFixed(3)} hintKey="precision" />
            <MetricCard label="Recall" value={metrics.recall?.toFixed(3)} hintKey="recall" />
          </div>
        ) : (
          <div className="ui-metricgrid ui-metricgrid--3">
            <MetricCard label="R²" value={metrics.r2?.toFixed(3)} hintKey="r2" />
            <MetricCard label="RMSE" value={metrics.rmse?.toFixed(2)} hintKey="rmse" />
            <MetricCard label="MAE" value={metrics.mae?.toFixed(2)} hintKey="mae" />
          </div>
        )}
      </div>

      {lossData.length > 0 && (
        <div className="ui-card ui-mlcard">
          <div className="ui-mlhead">
            <p className="ui-chart-title">Training loss</p>
            <GlossaryTip hint={ML_GLOSSARY.training_loss} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lossData}>
              <XAxis dataKey="epoch" tick={{ fill: MUTED, fontSize: 11 }} label={{ value: "Epoch", position: "insideBottom", offset: -2, fill: MUTED, fontSize: 11 }} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} width={55} />
              <Tooltip contentStyle={{ ...TOOLTIP_STYLE }} />
              <Line type="monotone" dataKey="loss" stroke={BRAND} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {importanceData.length > 0 && (
        <div className="ui-card ui-mlcard">
          <div className="ui-mlhead">
            <p className="ui-chart-title">Feature importance</p>
            <GlossaryTip hint={ML_GLOSSARY.feature_importance} />
          </div>
          <ResponsiveContainer width="100%" height={Math.min(280, Math.max(120, importanceData.length * 22))}>
            <BarChart data={importanceData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-2)", fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ ...TOOLTIP_STYLE }} />
              <Bar dataKey="value" fill={BRAND} fillOpacity={0.8} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {test_predictions && <PredActualChart testPredictions={test_predictions} target={target} />}

      {class_breakdown && <ClassBreakdownChart classBreakdown={class_breakdown} />}

      {confusion_matrix && confusion_labels && (
        <div className="ui-card ui-mlcard">
          <p className="ui-chart-title" style={{ marginBottom: 12 }}>
            Confusion matrix <span className="ui-mlsoft">(rows = actual, cols = predicted)</span>
          </p>
          <div className="ui-btable-wrap">
            <table className="ui-confmatrix">
              <thead>
                <tr>
                  <th>actual \ pred</th>
                  {confusion_labels.map((l) => (
                    <th key={l}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusion_matrix.map((row, ri) => {
                  const rowSum = row.reduce((a, b) => a + b, 0)
                  return (
                    <tr key={ri}>
                      <td className="ui-confmatrix-label">{confusion_labels[ri]}</td>
                      {row.map((val, ci) => {
                        const intensity = rowSum > 0 ? val / rowSum : 0
                        const isCorrect = ri === ci
                        return (
                          <td
                            key={ci}
                            style={{
                              background: isCorrect
                                ? `rgba(37,99,235,${Math.max(0.1, intensity)})`
                                : intensity > 0.05
                                  ? `rgba(239,68,68,${intensity * 0.6})`
                                  : undefined,
                              color: intensity > 0.4 ? "#fff" : undefined,
                            }}
                          >
                            {val}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
