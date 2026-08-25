import { useRef, type RefObject } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import { cn } from "../cn"

export type ChartType = "bar" | "horizontal_bar" | "line" | "scatter"
export type ChartRow = Record<string, unknown>

const BRAND = "var(--brand)"
const BRAND_LIGHT = "var(--brand-light)"
const BORDER = "var(--border-strong)"
const MUTED = "var(--muted)"
const SURFACE = "var(--surface-2)"
const SECONDARY = "var(--text-2)"

// Categorical palette for multi-series contexts; single-series charts use brand.
const PALETTE = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#F97316", "#14B8A6", "#EC4899"]

export function chartPalette(i: number): string {
  return PALETTE[i % PALETTE.length]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value?: unknown; payload?: ChartRow }>
  label?: unknown
  xKey: string
  yKey: string
  scatter?: boolean
}

function CustomTooltip({ active, payload, label, xKey, yKey, scatter }: TooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  const point = (entry?.payload ?? {}) as ChartRow
  const name = (point.name ?? point.Name ?? point.team ?? point.Team ?? "") as string
  return (
    <div className="ui-tooltip">
      {scatter ? (
        <>
          <p className="ui-tooltip-title">{name}</p>
          <p className="ui-tooltip-row">
            {xKey}: <strong>{String(point[xKey] ?? "")}</strong>
          </p>
          <p className="ui-tooltip-row">
            {yKey}: <strong>{String(point[yKey] ?? "")}</strong>
          </p>
        </>
      ) : (
        <>
          <p className="ui-tooltip-title">{String(label ?? point.name ?? "")}</p>
          <p className="ui-tooltip-row">
            {yKey}: <strong>{String(entry?.value ?? "")}</strong>
          </p>
        </>
      )}
    </div>
  )
}

function tickFormat(v: unknown): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  if (Number.isInteger(n)) return String(n)
  const abs = Math.abs(n)
  if (abs >= 10) return n.toFixed(0)
  if (abs >= 1) return n.toFixed(1)
  return n.toFixed(2)
}

const AXIS_PROPS = {
  tick: { fill: MUTED, fontSize: 11 },
  axisLine: { stroke: BORDER },
  tickLine: false,
  tickFormatter: tickFormat,
} as const

const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 16 }

interface Props {
  type: ChartType
  title?: string
  data?: ChartRow[] | null
  xKey?: string
  yKey?: string
  color?: string
  height?: number
}

/**
 * The one chart for AI-shaped data: pass rows + which keys to plot and pick a
 * shape. Renders an empty state on no data and offers PNG/CSV export.
 */
export function DynamicChart({ type, title, data, xKey = "name", yKey = "value", color, height = 180 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  if (!data?.length) {
    return <div className="ui-chart-empty">{title ? `${title} — no data` : "No data"}</div>
  }

  let chart = null

  if (type === "bar") {
    chart = (
      <BarChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid vertical={false} stroke={BORDER} strokeDasharray="3 3" strokeOpacity={0.6} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} interval={0} tick={{ ...AXIS_PROPS.tick, fontSize: 10 }} />
        <YAxis {...AXIS_PROPS} width={40} />
        <Tooltip content={<CustomTooltip xKey={xKey} yKey={yKey} />} cursor={{ fill: SURFACE }} />
        <Bar dataKey={yKey} fill={color || BRAND} fillOpacity={0.85} radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    )
  } else if (type === "horizontal_bar") {
    chart = (
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 4, bottom: 16 }}>
        <XAxis type="number" {...AXIS_PROPS} />
        <YAxis type="category" dataKey={xKey} {...AXIS_PROPS} width={90} tick={{ ...AXIS_PROPS.tick, fontSize: 10 }} />
        <Tooltip content={<CustomTooltip xKey={xKey} yKey={yKey} />} cursor={{ fill: SURFACE }} />
        <Bar dataKey={yKey} radius={[0, 3, 3, 0]} maxBarSize={16}>
          <LabelList dataKey={yKey} position="right" style={{ fill: SECONDARY, fontSize: 10 }} />
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? BRAND_LIGHT : color || BRAND} fillOpacity={i === 0 ? 1 : 0.65} />
          ))}
        </Bar>
      </BarChart>
    )
  } else if (type === "line") {
    chart = (
      <LineChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" strokeOpacity={0.6} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} width={40} />
        <Tooltip content={<CustomTooltip xKey={xKey} yKey={yKey} />} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color || BRAND_LIGHT}
          strokeWidth={2}
          dot={{ fill: color || BRAND_LIGHT, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    )
  } else if (type === "scatter") {
    chart = (
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
        <CartesianGrid stroke={BORDER} strokeDasharray="3 3" strokeOpacity={0.6} />
        <XAxis
          type="number"
          dataKey={xKey}
          name={xKey}
          {...AXIS_PROPS}
          label={{ value: xKey, position: "insideBottom", offset: -2, fill: MUTED, fontSize: 10 }}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={yKey}
          {...AXIS_PROPS}
          width={40}
          label={{ value: yKey, angle: -90, position: "insideLeft", fill: MUTED, fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip xKey={xKey} yKey={yKey} scatter />} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill={color || BRAND} fillOpacity={0.8} />
      </ScatterChart>
    )
  }

  if (!chart) return null

  return (
    <div className="ui-chart">
      <div className="ui-chart-head">
        {title && <p className="ui-chart-title">{title}</p>}
        <ExportButtons containerRef={containerRef} title={title} data={data} />
      </div>
      <div ref={containerRef}>
        <ResponsiveContainer width="100%" height={height}>
          {chart}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ExportButtons({ containerRef, title, data }: { containerRef: RefObject<HTMLDivElement | null>; title?: string; data: ChartRow[] }) {
  function exportPng() {
    const svg = containerRef.current?.querySelector("svg")
    if (!svg || !containerRef.current) return

    const rect = svg.getBoundingClientRect()
    const scale = 2
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(scale, scale)
    const bgColor = getComputedStyle(containerRef.current).backgroundColor || "#ffffff"
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, rect.width, rect.height)

    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return
        const a = document.createElement("a")
        a.href = URL.createObjectURL(pngBlob)
        a.download = `${title || "chart"}.png`
        a.click()
      })
    }
    img.src = url
  }

  function exportCsv() {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const rows = [keys.join(","), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))]
    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${title || "chart"}.csv`
    a.click()
  }

  return (
    <div className={cn("ui-export-btns")}>
      <button onClick={exportPng} title="Download PNG" className="ui-export-btn" type="button">
        PNG
      </button>
      <button onClick={exportCsv} title="Download CSV" className="ui-export-btn" type="button">
        CSV
      </button>
    </div>
  )
}
