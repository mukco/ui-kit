import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

export interface ClassBreakdownEntry {
  class: string
  precision: number
  recall: number
  f1: number
  support: number
}

interface Props {
  classBreakdown: ClassBreakdownEntry[]
}

const TOOLTIP_STYLE = {
  background: "var(--surface-2)",
  border: "1px solid var(--border-strong)",
  borderRadius: 6,
  itemStyle: { color: "var(--text)", fontSize: 12 },
} as const

/** Per-class precision / recall / F1 with support in the tooltip — where a
    classifier is quietly failing on rare classes. */
export function ClassBreakdownChart({ classBreakdown }: Props) {
  if (!classBreakdown || classBreakdown.length === 0) return null

  const data = classBreakdown.map((c) => ({
    name: c.class,
    Precision: c.precision,
    Recall: c.recall,
    F1: c.f1,
    support: c.support,
  }))

  return (
    <div className="ui-card ui-mlcard">
      <p className="ui-chart-title">Per-class precision / recall / F1</p>
      <p className="ui-sb-note" style={{ marginBottom: 12 }}>
        Support (n rows) shown in tooltip. Weak classes often have small support — check your bins.
      </p>
      <ResponsiveContainer width="100%" height={Math.max(160, classBreakdown.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4 }}>
          <XAxis type="number" domain={[0, 1]} tick={{ fill: "var(--muted)", fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-2)", fontSize: 11 }} width={72} />
          <Tooltip
            contentStyle={{ ...TOOLTIP_STYLE }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any, name: any, props: any) => {
              const extra = name === "Precision" ? ` (n=${props.payload.support})` : ""
              return [`${Number(val).toFixed(3)}${extra}`, String(name)]
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
          <Bar dataKey="Precision" fill="var(--brand)" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="Recall" fill="var(--series-3)" radius={[0, 3, 3, 0]} barSize={8} />
          <Bar dataKey="F1" fill="var(--series-2)" radius={[0, 3, 3, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
