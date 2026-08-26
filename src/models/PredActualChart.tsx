import { useMemo } from "react"
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
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

function ResidualsHistogram({ yTrue, yPred }: { yTrue: number[]; yPred: number[] }) {
  const bins = useMemo(() => {
    const residuals = yPred.map((p, i) => p - yTrue[i])
    if (!residuals.length) return []
    const min = Math.min(...residuals)
    const max = Math.max(...residuals)
    const range = max - min || 1
    const buckets = 20
    const width = range / buckets
    const counts = Array<number>(buckets).fill(0)
    for (const r of residuals) {
      counts[Math.min(Math.floor((r - min) / width), buckets - 1)]++
    }
    return counts.map((count, i) => ({ mid: +(min + (i + 0.5) * width).toFixed(3), count }))
  }, [yTrue, yPred])

  return (
    <div className="ui-card ui-mlcard">
      <div className="ui-mlhead">
        <p className="ui-chart-title">
          Residuals distribution <span className="ui-mlsoft">(predicted − actual)</span>
        </p>
        <GlossaryTip hint={ML_GLOSSARY.residuals} />
      </div>
      <p className="ui-sb-note">A symmetric bell centred near 0 means errors are unbiased.</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={bins} margin={{ left: 4, right: 8, bottom: 20 }}>
          <XAxis
            dataKey="mid"
            type="number"
            domain={["dataMin", "dataMax"]}
            tick={{ fill: MUTED, fontSize: 10 }}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{ value: "Residual (predicted − actual)", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 11 }}
          />
          <YAxis tick={{ fill: MUTED, fontSize: 10 }} width={32} label={{ value: "Count", angle: -90, position: "insideLeft", offset: 14, fill: MUTED, fontSize: 11 }} />
          <Tooltip contentStyle={{ ...TOOLTIP_STYLE }} formatter={(val) => [String(val), "rows"]} labelFormatter={(v) => `Residual ≈ ${Number(v).toFixed(3)}`} />
          <ReferenceLine x={0} stroke={MUTED} strokeDasharray="3 3" strokeOpacity={0.7} />
          <Bar dataKey="count" fill={BRAND} fillOpacity={0.75} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy } = props
  return <circle cx={cx} cy={cy} r={3} fill="var(--brand)" fillOpacity={0.55} stroke="none" />
}

interface Props {
  testPredictions: { y_true: number[]; y_pred: number[]; sampled?: boolean }
  target?: string
}

/** Predicted-vs-actual scatter against the diagonal, plus the residual
    histogram — the two plots that grade a regression honestly. */
export function PredActualChart({ testPredictions, target }: Props) {
  const { y_true, y_pred, sampled } = testPredictions
  const points = y_true.map((t, i) => ({ true: t, pred: y_pred[i] }))
  const allVals = [...y_true, ...y_pred]
  const lo = Math.min(...allVals)
  const hi = Math.max(...allVals)

  return (
    <div className="ui-mlstack">
      <div className="ui-card ui-mlcard">
        <p className="ui-chart-title">
          Predicted vs Actual — {target ?? "target"}
          {sampled && <span className="ui-mlsoft"> (500-point sample)</span>}
        </p>
        <p className="ui-sb-note" style={{ marginBottom: 12 }}>
          Points on the diagonal = perfect predictions. Spread = error magnitude.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart margin={{ left: 4, right: 8, bottom: 20 }}>
            <XAxis
              dataKey="true"
              type="number"
              name="Actual"
              domain={[lo, hi]}
              tick={{ fill: MUTED, fontSize: 10 }}
              label={{ value: "Actual", position: "insideBottom", offset: -10, fill: MUTED, fontSize: 11 }}
            />
            <YAxis
              dataKey="pred"
              type="number"
              name="Predicted"
              domain={[lo, hi]}
              tick={{ fill: MUTED, fontSize: 10 }}
              width={50}
              label={{ value: "Predicted", angle: -90, position: "insideLeft", offset: 10, fill: MUTED, fontSize: 11 }}
            />
            <Tooltip contentStyle={{ ...TOOLTIP_STYLE }} formatter={(val) => [Number(val).toFixed(4)]} />
            <ReferenceLine segment={[{ x: lo, y: lo }, { x: hi, y: hi }]} stroke="var(--border-strong)" strokeDasharray="4 3" />
            <Scatter data={points} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <ResidualsHistogram yTrue={y_true} yPred={y_pred} />
    </div>
  )
}
