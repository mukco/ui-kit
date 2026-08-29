import {
  Avatar,
  AwardCard,
  BasicTable,
  Box,
  Button,
  Card,
  CardStrip,
  DataTable,
  DateNav,
  DynamicChart,
  EmptyState,
  ErrorState,
  ExpandableCard,
  FactGrid,
  InlineStatRow,
  InsightsCard,
  ListRow,
  ListRows,
  Loading,
  LogStream,
  MatchupCard,
  NavBar,
  PageHeader,
  PercentileGauge,
  RollingAverageChart,
  SearchSelect,
  SectionLabel,
  SparklineChart,
  StatCard,
  StatusDot,
  StatusGrid,
  Tabs,
  Text,
  TimeRangePicker,
  Toggle,
  Chip,
  SettingRow,
  TriageList,
  parseLogBody,
} from "../../src"
import type { ChipTone } from "../../src"
import type { StatusTileItem } from "../../src"
import type { TriageItem } from "../../src"
import type { ComponentDef } from "./types"

function esc(s: string): string {
  return s.replace(/"/g, "&quot;")
}

function demoLogo(id: string): string {
  const colors = ["#1e66e4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"]
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const color = colors[h % colors.length]!
  const letter = id[0]?.toUpperCase() ?? "?"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="${color}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="800" fill="#fff">${letter}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const CHIP_TONES: ChipTone[] = ["ok", "stale", "muted", "danger"]
function asChipTone(v: string | undefined): ChipTone {
  return CHIP_TONES.includes(v as ChipTone) ? (v as ChipTone) : "muted"
}

const DEMO_TILES: StatusTileItem[] = [
  { id: "hub", name: "Family Hub", tone: "ok", metric: "12ms", series: [{ v: 8 }, { v: 10 }, { v: 9 }, { v: 12 }, { v: 11 }, { v: 12 }], seriesKey: "v" },
  { id: "baseball", name: "Baseball", tone: "ok", metric: "18ms", series: [{ v: 14 }, { v: 16 }, { v: 15 }, { v: 17 }, { v: 18 }, { v: 18 }], seriesKey: "v" },
  { id: "push", name: "Push", tone: "warn", metric: "410ms", detail: "workers stale", series: [{ v: 50 }, { v: 120 }, { v: 300 }, { v: 250 }, { v: 380 }, { v: 410 }], seriesKey: "v" },
  { id: "gateway", name: "gateway", tone: "unknown", detail: "not reporting" },
]

const DEMO_TRIAGE: TriageItem[] = [
  { id: "1", severity: "critical", title: "NoFuss stopped answering", detail: "Refused 3 checks", at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "2", severity: "warn", title: "Push · workers stale", detail: "Last heartbeat 14m ago", at: new Date(Date.now() - 14 * 60000).toISOString() },
]

const TEAM_STATS = [
  { name: "Riverton", ops: 0.812, era: 3.42, runs: 612 },
  { name: "Northside", ops: 0.774, era: 3.98, runs: 588 },
  { name: "Ridgeview", ops: 0.795, era: 4.1, runs: 601 },
]

export const REGISTRY: ComponentDef[] = [
  // ---------- Primitives ----------
  {
    type: "Button",
    label: "Button",
    category: "Primitives",
    icon: "⧉",
    imports: ["Button"],
    defaultW: 3,
    defaults: { children: "Refresh", tone: "quiet", size: "md" },
    propDefs: [
      { key: "children", label: "Label", type: "string" },
      { key: "tone", label: "Tone", type: "select", options: [{ value: "primary", label: "primary" }, { value: "quiet", label: "quiet" }, { value: "danger", label: "danger" }, { value: "danger-quiet", label: "danger-quiet" }] },
      { key: "size", label: "Size", type: "select", options: [{ value: "sm", label: "sm" }, { value: "md", label: "md" }] },
    ],
    render: (p) => <Button tone={p.tone as never} size={p.size as never}>{String(p.children)}</Button>,
    code: (p) => `<Button tone="${esc(String(p.tone))}" size="${esc(String(p.size))}">${esc(String(p.children))}</Button>`,
  },
  {
    type: "Text",
    label: "Text",
    category: "Primitives",
    icon: "T",
    imports: ["Text"],
    defaultW: 6,
    defaults: { children: "Body text — replace with your copy.", size: "md", tone: "default", weight: "normal" },
    propDefs: [
      { key: "children", label: "Text", type: "textarea", placeholder: "Text content" },
      { key: "size", label: "Size", type: "select", options: [{ value: "sm", label: "sm" }, { value: "md", label: "md" }, { value: "lg", label: "lg" }, { value: "xl", label: "xl" }] },
      { key: "tone", label: "Tone", type: "select", options: [{ value: "default", label: "default" }, { value: "muted", label: "muted" }, { value: "brand", label: "brand" }] },
      { key: "weight", label: "Weight", type: "select", options: [{ value: "normal", label: "normal" }, { value: "medium", label: "medium" }, { value: "bold", label: "bold" }] },
    ],
    render: (p) => <Text size={p.size as never} tone={p.tone as never} weight={p.weight as never}>{String(p.children)}</Text>,
    code: (p) => {
      const size = p.size !== "md" ? ` size="${esc(String(p.size))}"` : ""
      const tone = p.tone !== "default" ? ` tone="${esc(String(p.tone))}"` : ""
      const weight = p.weight !== "normal" ? ` weight="${esc(String(p.weight))}"` : ""
      return `<Text${size}${tone}${weight}>${esc(String(p.children))}</Text>`
    },
  },
  {
    type: "Badge",
    label: "Badge",
    category: "Primitives",
    icon: "●",
    imports: ["Chip"],
    defaultW: 2,
    defaults: { children: "Live", tone: "ok" },
    propDefs: [
      { key: "children", label: "Label", type: "string" },
      { key: "tone", label: "Tone", type: "select", options: [{ value: "ok", label: "ok" }, { value: "stale", label: "stale" }, { value: "muted", label: "muted" }, { value: "danger", label: "danger" }] },
    ],
    render: (p) => <Chip tone={p.tone as never}>{String(p.children)}</Chip>,
    code: (p) => `<Chip tone="${esc(String(p.tone))}">${esc(String(p.children))}</Chip>`,
  },
  {
    type: "Avatar",
    label: "Avatar",
    category: "Primitives",
    icon: "◉",
    imports: ["Avatar"],
    defaultW: 2,
    defaults: { name: "Ava Martinez", size: 32 },
    propDefs: [
      { key: "name", label: "Name", type: "string" },
      { key: "size", label: "Size (px)", type: "number", min: 16, max: 96 },
    ],
    render: (p) => <Avatar name={String(p.name)} size={Number(p.size)} />,
    code: (p) => `<Avatar name="${esc(String(p.name))}" size={${Number(p.size)}} />`,
  },
  {
    type: "ChipRow",
    label: "Chips",
    category: "Primitives",
    icon: "⬔",
    imports: ["Chip"],
    defaultW: 4,
    defaults: { chips: "Live:ok, Stale:stale, Cached:muted" },
    propDefs: [{ key: "chips", label: "Chips (label:tone comma list)", type: "string", placeholder: "Live:ok, Stale:stale" }],
    render: (p) => {
      const chips = String(p.chips).split(",").map((s) => s.trim()).filter(Boolean).map((c) => {
        const [label, tone] = c.split(":").map((x) => x.trim())
        return { label: label ?? c, tone: asChipTone(tone) }
      })
      return <Card><span style={{ display: "inline-flex", gap: "0.375rem", flexWrap: "wrap" }}>{chips.map((c) => <Chip key={c.label} tone={c.tone}>{c.label}</Chip>)}</span></Card>
    },
    code: (p) => {
      const chips = String(p.chips).split(",").map((s) => s.trim()).filter(Boolean).map((c) => {
        const [label, tone] = c.split(":").map((x) => x.trim())
        return `  <Chip tone="${esc(asChipTone(tone))}">${esc(label ?? c)}</Chip>`
      }).join("\n")
      return `<span style={{ display: "inline-flex", gap: "0.375rem" }}>\n${chips}\n</span>`
    },
  },

  // ---------- Layout ----------
  {
    type: "Box",
    label: "Box",
    category: "Layout",
    icon: "▢",
    imports: ["Box"],
    defaultW: 6,
    defaults: { children: "Drop components in from the palette, or edit this placeholder text.", surface: "surface", padding: "md", border: true },
    propDefs: [
      { key: "children", label: "Body (placeholder, shown until you drop something in)", type: "textarea" },
      { key: "surface", label: "Surface", type: "select", options: [{ value: "surface", label: "surface" }, { value: "surface-2", label: "surface-2" }, { value: "transparent", label: "transparent" }] },
      { key: "padding", label: "Padding", type: "select", options: [{ value: "none", label: "none" }, { value: "sm", label: "sm" }, { value: "md", label: "md" }, { value: "lg", label: "lg" }] },
      { key: "border", label: "Border", type: "boolean" },
    ],
    container: true,
    render: (p, children) => <Box surface={p.surface as never} padding={p.padding as never} border={Boolean(p.border)}>{children ?? String(p.children)}</Box>,
    code: (p) => {
      const surface = p.surface !== "surface" ? ` surface="${esc(String(p.surface))}"` : ""
      const padding = p.padding !== "md" ? ` padding="${esc(String(p.padding))}"` : ""
      const border = p.border === false ? " border={false}" : ""
      return `<Box${surface}${padding}${border}>${esc(String(p.children))}</Box>`
    },
    codeOpen: (p) => {
      const surface = p.surface !== "surface" ? ` surface="${esc(String(p.surface))}"` : ""
      const padding = p.padding !== "md" ? ` padding="${esc(String(p.padding))}"` : ""
      const border = p.border === false ? " border={false}" : ""
      return `<Box${surface}${padding}${border}>`
    },
    codeClose: () => "</Box>",
  },
  {
    type: "Card",
    label: "Card",
    category: "Layout",
    icon: "▭",
    imports: ["Card"],
    defaultW: 6,
    defaults: { title: "Card title", children: "Card content — replace with your copy. Cards are the default surface." },
    propDefs: [
      { key: "title", label: "Title", type: "string" },
      { key: "children", label: "Body", type: "textarea" },
    ],
    render: (p) => <Card title={String(p.title)}>{String(p.children)}</Card>,
    code: (p) => `<Card title="${esc(String(p.title))}">${esc(String(p.children))}</Card>`,
  },
  {
    type: "PageHeader",
    label: "Page Header",
    category: "Layout",
    icon: "☰",
    imports: ["PageHeader"],
    defaultW: 12,
    defaults: { title: "Season summary", subtitle: "Week 14 · through Tuesday", showBack: false },
    propDefs: [
      { key: "title", label: "Title", type: "string" },
      { key: "subtitle", label: "Subtitle", type: "string" },
      { key: "showBack", label: "Back button", type: "boolean" },
    ],
    render: (p) => <PageHeader title={String(p.title)} subtitle={p.subtitle ? String(p.subtitle) : undefined} onBack={p.showBack ? () => {} : undefined} />,
    code: (p) => {
      const sub = p.subtitle ? `\n  subtitle="${esc(String(p.subtitle))}"` : ""
      const back = p.showBack ? `\n  onBack={() => history.back()}` : ""
      return `<PageHeader\n  title="${esc(String(p.title))}"${sub}${back}\n/>`
    },
  },
  {
    type: "SectionLabel",
    label: "Section Label",
    category: "Layout",
    icon: "—",
    imports: ["SectionLabel"],
    defaultW: 12,
    defaults: { children: "Recent activity" },
    propDefs: [{ key: "children", label: "Text", type: "string" }],
    render: (p) => <SectionLabel>{String(p.children)}</SectionLabel>,
    code: (p) => `<SectionLabel>${esc(String(p.children))}</SectionLabel>`,
  },
  {
    type: "CardStrip",
    label: "Card Strip",
    category: "Layout",
    icon: "⟡",
    imports: ["CardStrip", "MatchupCard"],
    defaultW: 12,
    defaults: {},
    propDefs: [],
    render: () => (
      <CardStrip>
        {["north", "east", "west"].map((id) => (
          <MatchupCard key={id} away={{ name: id, logoUrl: demoLogo(id), score: 3 }} home={{ name: "Riverton", logoUrl: demoLogo("RIV"), score: 4 }} status="Final" tone="final" />
        ))}
      </CardStrip>
    ),
    code: () => {
      const cards = ["north", "east", "west"]
        .map((id) => `  <MatchupCard away={{ name: "${id}", logoUrl: "/logos/${id}.png", score: 3 }} home={{ name: "Riverton", logoUrl: "/logos/riverton.png", score: 4 }} status="Final" tone="final" />`)
        .join("\n")
      return `<CardStrip>\n${cards}\n</CardStrip>`
    },
  },
  {
    type: "ExpandableCard",
    label: "Expandable Card",
    category: "Layout",
    icon: "▾",
    imports: ["ExpandableCard"],
    defaultW: 6,
    defaults: { title: "Season splits", subtitle: "Tap to expand", children: "vs LHP: .298/.361/.482\nvs RHP: .318/.379/.501" },
    propDefs: [
      { key: "title", label: "Title", type: "string" },
      { key: "subtitle", label: "Subtitle", type: "string" },
      { key: "children", label: "Body", type: "textarea" },
    ],
    render: (p) => <ExpandableCard title={String(p.title)} subtitle={String(p.subtitle)}>{String(p.children)}</ExpandableCard>,
    code: (p) => `<ExpandableCard title="${esc(String(p.title))}" subtitle="${esc(String(p.subtitle))}">\n  ${esc(String(p.children))}\n</ExpandableCard>`,
  },

  // ---------- Data ----------
  {
    type: "StatCard",
    label: "Stat Card",
    category: "Data",
    icon: "◈",
    imports: ["StatCard"],
    defaultW: 4,
    defaults: { label: "Batting avg", value: ".312", percentile: 78, invert: false, neutral: false },
    propDefs: [
      { key: "label", label: "Label", type: "string" },
      { key: "value", label: "Value", type: "string" },
      { key: "percentile", label: "Percentile", type: "number", min: 0, max: 100, hint: "0–100, paints the ramp" },
      { key: "invert", label: "Invert (lower better)", type: "boolean" },
      { key: "neutral", label: "Neutral tint", type: "boolean" },
    ],
    render: (p) => (
      <StatCard
        label={String(p.label)}
        value={String(p.value)}
        percentile={p.percentile === "" || p.percentile == null ? null : Number(p.percentile)}
        invert={Boolean(p.invert)}
        neutral={Boolean(p.neutral)}
      />
    ),
    code: (p) => {
      const pct = p.percentile === "" || p.percentile == null ? "" : ` percentile={${Number(p.percentile)}}`
      const inv = p.invert ? " invert" : ""
      const neu = p.neutral ? " neutral" : ""
      return `<StatCard label="${esc(String(p.label))}" value="${esc(String(p.value))}"${pct}${inv}${neu} />`
    },
  },
  {
    type: "MatchupCard",
    label: "Matchup Card",
    category: "Data",
    icon: "⚔",
    imports: ["MatchupCard"],
    defaultW: 6,
    defaults: { away: "Riverton", home: "Northside", awayScore: 4, homeScore: 6, status: "Final", tone: "final", detail: "WP: Ava Martinez" },
    propDefs: [
      { key: "away", label: "Away team", type: "string" },
      { key: "home", label: "Home team", type: "string" },
      { key: "awayScore", label: "Away score", type: "number" },
      { key: "homeScore", label: "Home score", type: "number" },
      { key: "status", label: "Status", type: "string" },
      { key: "tone", label: "Tone", type: "select", options: [{ value: "live", label: "live" }, { value: "final", label: "final" }, { value: "upcoming", label: "upcoming" }] },
      { key: "detail", label: "Detail line", type: "string" },
    ],
    render: (p) => (
      <MatchupCard
        away={{ name: String(p.away), score: Number(p.awayScore) }}
        home={{ name: String(p.home), score: Number(p.homeScore) }}
        status={String(p.status)}
        tone={p.tone as never}
        detail={String(p.detail)}
      />
    ),
    code: (p) => `<MatchupCard\n  away={{ name: "${esc(String(p.away))}", score: ${Number(p.awayScore)} }}\n  home={{ name: "${esc(String(p.home))}", score: ${Number(p.homeScore)} }}\n  status="${esc(String(p.status))}"\n  tone="${esc(String(p.tone))}"\n  detail="${esc(String(p.detail))}"\n/>`,
  },
  {
    type: "AwardCard",
    label: "Award Card",
    category: "Data",
    icon: "🏆",
    imports: ["AwardCard"],
    defaultW: 4,
    defaults: { icon: "🏆", label: "MVP", winner: "Ava Martinez", detail: ".894 OPS · 34 HR" },
    propDefs: [
      { key: "icon", label: "Icon", type: "string" },
      { key: "label", label: "Label", type: "string" },
      { key: "winner", label: "Winner", type: "string" },
      { key: "detail", label: "Detail", type: "string" },
    ],
    render: (p) => <AwardCard icon={String(p.icon)} label={String(p.label)} winner={String(p.winner)} detail={String(p.detail)} />,
    code: (p) => `<AwardCard icon="${esc(String(p.icon))}" label="${esc(String(p.label))}" winner="${esc(String(p.winner))}" detail="${esc(String(p.detail))}" />`,
  },
  {
    type: "StatusGrid",
    label: "Status Grid",
    category: "Data",
    icon: "⊞",
    imports: ["StatusGrid"],
    defaultW: 12,
    defaults: { selected: "push" },
    propDefs: [{ key: "selected", label: "Selected id", type: "string", placeholder: "hub" }],
    render: (p) => <StatusGrid items={DEMO_TILES} selected={String(p.selected) || null} />,
    code: (p) => `<StatusGrid items={tiles} selected="${esc(String(p.selected))}" />`,
  },
  {
    type: "TriageList",
    label: "Triage List",
    category: "Data",
    icon: "⚠",
    imports: ["TriageList"],
    defaultW: 6,
    defaults: {},
    propDefs: [],
    render: () => <TriageList items={DEMO_TRIAGE} />,
    code: () => `<TriageList items={items} />`,
  },
  {
    type: "StatusDot",
    label: "Status Dot",
    category: "Data",
    icon: "●",
    imports: ["StatusDot"],
    defaultW: 2,
    defaults: { tone: "ok", pulse: false },
    propDefs: [
      { key: "tone", label: "Tone", type: "select", options: [{ value: "ok", label: "ok" }, { value: "warn", label: "warn" }, { value: "critical", label: "critical" }, { value: "unknown", label: "unknown" }] },
      { key: "pulse", label: "Pulse", type: "boolean" },
    ],
    render: (p) => <StatusDot tone={p.tone as never} pulse={Boolean(p.pulse)} />,
    code: (p) => `<StatusDot tone="${esc(String(p.tone))}"${p.pulse ? " pulse" : ""} />`,
  },
  {
    type: "InlineStatRow",
    label: "Inline Stats",
    category: "Data",
    icon: "≡",
    imports: ["InlineStatRow"],
    defaultW: 6,
    defaults: { stats: "Workers:8, Ready:0, Running:0, Failed:3" },
    propDefs: [{ key: "stats", label: "Stats (label:value comma list)", type: "string" }],
    render: (p) => {
      const stats = String(p.stats).split(",").map((s) => s.trim()).filter(Boolean).map((c) => {
        const [label, value] = c.split(":").map((x) => x.trim())
        return { label: label ?? c, value: value ?? "" }
      })
      return <InlineStatRow stats={stats} />
    },
    code: (p) => {
      const stats = String(p.stats).split(",").map((s) => s.trim()).filter(Boolean).map((c) => {
        const [label, value] = c.split(":").map((x) => x.trim())
        return `{ label: "${esc(label ?? c)}", value: "${esc(value ?? "")}" }`
      }).join(", ")
      return `<InlineStatRow stats={[${stats}]} />`
    },
  },
  {
    type: "ListRow",
    label: "List Row",
    category: "Data",
    icon: "☷",
    imports: ["ListRow", "ListRows"],
    defaultW: 12,
    defaults: { title: "worker-3", meta: "queue: default", detail: "Completed 500 Internal Server Error in 288ms", tone: "critical", edge: true },
    propDefs: [
      { key: "title", label: "Title", type: "string" },
      { key: "meta", label: "Meta", type: "string" },
      { key: "detail", label: "Detail", type: "textarea" },
      { key: "tone", label: "Tone", type: "select", options: [{ value: "ok", label: "ok" }, { value: "warn", label: "warn" }, { value: "critical", label: "critical" }, { value: "unknown", label: "unknown" }] },
      { key: "edge", label: "Colored edge", type: "boolean" },
    ],
    render: (p) => (
      <ListRows>
        <ListRow title={String(p.title)} meta={String(p.meta)} detail={String(p.detail)} tone={p.tone as never} edge={Boolean(p.edge)} />
      </ListRows>
    ),
    code: (p) => `<ListRow title="${esc(String(p.title))}" meta="${esc(String(p.meta))}" detail="${esc(String(p.detail))}" tone="${esc(String(p.tone))}"${p.edge ? " edge" : ""} />`,
  },
  {
    type: "FactGrid",
    label: "Fact Grid",
    category: "Data",
    icon: "⊞",
    imports: ["FactGrid"],
    defaultW: 6,
    defaults: { facts: "Image:ruby:3.3, Region:us-east, Uptime:14d" },
    propDefs: [{ key: "facts", label: "Facts (label:value comma list)", type: "string" }],
    render: (p) => {
      const facts = String(p.facts).split(",").map((s) => s.trim()).filter(Boolean).map((c) => {
        const [label, value] = c.split(":").map((x) => x.trim())
        return { label: label ?? c, value: value ?? "" }
      })
      return <FactGrid facts={facts} />
    },
    code: (p) => {
      const facts = String(p.facts).split(",").map((s) => s.trim()).filter(Boolean).map((c) => {
        const [label, value] = c.split(":").map((x) => x.trim())
        return `{ label: "${esc(label ?? c)}", value: "${esc(value ?? "")}" }`
      }).join(", ")
      return `<FactGrid facts={[${facts}]} />`
    },
  },
  {
    type: "DataTable",
    label: "Data Table",
    category: "Data",
    icon: "▦",
    imports: ["DataTable"],
    defaultW: 12,
    defaults: {},
    propDefs: [],
    render: () => (
      <DataTable
        data={TEAM_STATS}
        rowKey={(r) => (r as { name: string }).name}
        columns={[
          { key: "name", label: "Team", render: (r) => (r as never as typeof TEAM_STATS[number]).name },
          { key: "ops", label: "OPS", lowIsBetter: false, fmt: (v) => Number(v).toFixed(3) },
          { key: "era", label: "ERA", lowIsBetter: true, fmt: (v) => Number(v).toFixed(2) },
          { key: "runs", label: "R", align: "right" },
        ]}
      />
    ),
    code: () => `<DataTable\n  data={rows}\n  rowKey={(r) => r.name}\n  columns={[\n    { key: "name", label: "Team" },\n    { key: "ops", label: "OPS", lowIsBetter: false, fmt: (v) => Number(v).toFixed(3) },\n    { key: "era", label: "ERA", lowIsBetter: true, fmt: (v) => Number(v).toFixed(2) },\n    { key: "runs", label: "R", align: "right" },\n  ]}\n/>`,
  },
  {
    type: "InsightsCard",
    label: "Insights Card",
    category: "Data",
    icon: "✦",
    imports: ["InsightsCard"],
    defaultW: 6,
    defaults: { title: "AI Insights", heading: "What changed", bullets: "Ava Martinez raised rolling OPS from .781 to .894\nRiverton bullpen leads league in innings", cached: true },
    propDefs: [
      { key: "title", label: "Title", type: "string" },
      { key: "heading", label: "Section heading", type: "string" },
      { key: "bullets", label: "Bullets (one per line)", type: "textarea" },
      { key: "cached", label: "Cached badge", type: "boolean" },
    ],
    render: (p) => (
      <InsightsCard
        title={String(p.title)}
        cached={Boolean(p.cached)}
        onRegenerate={() => {}}
        sections={[{ heading: String(p.heading), bullets: String(p.bullets).split("\n").map((s) => s.trim()).filter(Boolean) }]}
      />
    ),
    code: (p) => {
      const bullets = String(p.bullets).split("\n").map((s) => s.trim()).filter(Boolean).map((b) => `        "${esc(b)}"`).join(",\n")
      const title = p.title && p.title !== "AI Insights" ? `\n  title="${esc(String(p.title))}"` : ""
      const cached = p.cached ? "\n  cached" : ""
      const head = p.heading ? `          heading: "${esc(String(p.heading))}",\n` : ""
      return `<InsightsCard${title}${cached}\n  onRegenerate={() => {}}\n  sections={[\n    {\n${head}      bullets: [\n${bullets}\n      ],\n    },\n  ]}\n/>`
    },
  },
  {
    type: "BasicTable",
    label: "Basic Table",
    category: "Data",
    icon: "☰",
    imports: ["BasicTable"],
    defaultW: 6,
    defaults: {},
    propDefs: [],
    render: () => (
      <BasicTable
        showSummary
        columns={["name", "team", "gp", "pts"]}
        rows={[
          ["Ava Martinez", "NOR", 22, 187],
          ["Ben Okafor", "EAS", 24, 203],
          ["Cleo Nguyen", "WEST", 19, null],
        ]}
      />
    ),
    code: () => `<BasicTable\n  showSummary\n  columns={["name", "team", "gp", "pts"]}\n  rows={[["Ava Martinez", "NOR", 22, 187], ["Ben Okafor", "EAS", 24, 203]]}\n/>`,
  },

  // ---------- Navigation ----------
  {
    type: "Tabs",
    label: "Tabs",
    category: "Navigation",
    icon: "≡",
    imports: ["Tabs"],
    defaultW: 12,
    defaults: { tabs: "Summary, Splits, Game log", active: "Summary" },
    propDefs: [
      { key: "tabs", label: "Tabs (comma list)", type: "string" },
      { key: "active", label: "Active tab", type: "string" },
    ],
    render: (p) => {
      const labels = String(p.tabs).split(",").map((s) => s.trim()).filter(Boolean)
      return <Tabs tabs={labels.map((label) => ({ id: label, label }))} active={String(p.active)} onChange={() => {}} />
    },
    code: (p) => {
      const labels = String(p.tabs).split(",").map((s) => s.trim()).filter(Boolean)
      const tabs = labels.map((label) => `{ id: "${esc(label)}", label: "${esc(label)}" }`).join(", ")
      return `<Tabs tabs={[${tabs}]} active="${esc(String(p.active))}" onChange={setActive} />`
    },
  },
  {
    type: "NavBar",
    label: "Nav Bar",
    category: "Navigation",
    icon: "🧭",
    imports: ["NavBar"],
    defaultW: 12,
    defaults: { brand: "⚾ Estate", active: "Today" },
    propDefs: [
      { key: "brand", label: "Brand", type: "string" },
      {
        key: "active", label: "Active item", type: "select",
        options: [
          { value: "Today", label: "Today" },
          { value: "Research", label: "Research" },
          { value: "Settings", label: "Settings" },
        ],
      },
    ],
    render: (p) => (
      <NavBar
        brand={String(p.brand)}
        items={["Today", "Research", "Settings"].map((label) => ({ label, href: "#", active: String(p.active) === label }))}
      />
    ),
    code: (p) => {
      const items = ["Today", "Research", "Settings"]
        .map((label) => (String(p.active) === label ? `{ label: "${label}", active: true }` : `{ label: "${label}" }`))
        .join(", ")
      return `<NavBar brand="${esc(String(p.brand))}" items={[${items}]} />`
    },
  },
  {
    type: "DateNav",
    label: "Date Nav",
    category: "Navigation",
    icon: "📅",
    imports: ["DateNav"],
    defaultW: 6,
    defaults: { date: new Date().toISOString().slice(0, 10) },
    propDefs: [{ key: "date", label: "Date (YYYY-MM-DD)", type: "string" }],
    render: (p) => <DateNav date={String(p.date)} onChange={() => {}} />,
    code: (p) => `<DateNav date="${esc(String(p.date))}" onChange={setDate} />`,
  },

  // ---------- Feedback ----------
  {
    type: "EmptyState",
    label: "Empty State",
    category: "Feedback",
    icon: "∅",
    imports: ["EmptyState"],
    defaultW: 12,
    defaults: { icon: "∅", children: "No items to show. The builder starts empty so you can see the empty state you actually ship." },
    propDefs: [
      { key: "icon", label: "Icon", type: "string" },
      { key: "children", label: "Message", type: "textarea" },
    ],
    render: (p) => <EmptyState icon={String(p.icon)}>{String(p.children)}</EmptyState>,
    code: (p) => `<EmptyState icon="${esc(String(p.icon))}">${esc(String(p.children))}</EmptyState>`,
  },
  {
    type: "ErrorState",
    label: "Error State",
    category: "Feedback",
    icon: "⚠",
    imports: ["ErrorState"],
    defaultW: 12,
    defaults: { children: "Couldn't load this panel.", icon: "⚠" },
    propDefs: [
      { key: "children", label: "Message", type: "string" },
      { key: "icon", label: "Icon", type: "string" },
    ],
    render: (p) => <ErrorState icon={String(p.icon)}>{String(p.children)}</ErrorState>,
    code: (p) => `<ErrorState icon="${esc(String(p.icon))}">${esc(String(p.children))}</ErrorState>`,
  },
  {
    type: "Loading",
    label: "Loading",
    category: "Feedback",
    icon: "◐",
    imports: ["Loading"],
    defaultW: 6,
    defaults: { label: "Checking…" },
    propDefs: [{ key: "label", label: "Label", type: "string" }],
    render: (p) => <Loading label={String(p.label)} />,
    code: (p) => `<Loading label="${esc(String(p.label))}" />`,
  },
  {
    type: "LogStream",
    label: "Log Stream",
    category: "Feedback",
    icon: "≡",
    imports: ["LogStream", "parseLogBody"],
    defaultW: 12,
    defaults: { body: "2026-08-28T10:29:12Z Booting worker\n2026-08-28T10:29:14Z WARN queue depth rising\n2026-08-28T10:29:20Z ERROR connection refused", footer: "300 lines · written 2m ago" },
    propDefs: [
      { key: "body", label: "Log body", type: "textarea" },
      { key: "footer", label: "Footer", type: "string" },
    ],
    render: (p) => <LogStream entries={parseLogBody(String(p.body), "estate-web")} footer={String(p.footer)} clampLines={6} />,
    code: (p) => `<LogStream entries={parseLogBody(body, "estate-web")} footer="${esc(String(p.footer))}" clampLines={6} />`,
  },

  // ---------- Forms ----------
  {
    type: "TimeRangePicker",
    label: "Time Range",
    category: "Forms",
    icon: "◷",
    imports: ["TimeRangePicker"],
    defaultW: 4,
    defaults: { value: "24h" },
    propDefs: [{ key: "value", label: "Selected", type: "select", options: [{ value: "1h", label: "1h" }, { value: "6h", label: "6h" }, { value: "24h", label: "24h" }, { value: "7d", label: "7d" }] }],
    render: (p) => <TimeRangePicker value={String(p.value)} onChange={() => {}} />,
    code: (p) => `<TimeRangePicker value="${esc(String(p.value))}" onChange={(r) => setHours(r.hours)} />`,
  },
  {
    type: "SearchSelect",
    label: "Search Select",
    category: "Forms",
    icon: "⌕",
    imports: ["SearchSelect"],
    defaultW: 6,
    defaults: {},
    propDefs: [],
    render: () => (
      <SearchSelect
        value={null}
        onChange={() => {}}
        fetcher={async () => []}
        getLabel={(item: { name: string }) => item.name}
        placeholder="Search players…"
      />
    ),
    code: () => `<SearchSelect\n  value={selected}\n  onChange={setSelected}\n  fetcher={searchPlayers}\n  getLabel={(item) => item.name}\n  placeholder="Search players…"\n/>`,
  },
  {
    type: "ToggleRow",
    label: "Toggle + Setting Row",
    category: "Forms",
    icon: "◫",
    imports: ["Toggle", "SettingRow"],
    defaultW: 6,
    defaults: { label: "Live scores", hint: "Refresh automatically while games are on", checked: true },
    propDefs: [
      { key: "label", label: "Label", type: "string" },
      { key: "hint", label: "Hint", type: "string" },
      { key: "checked", label: "Checked", type: "boolean" },
    ],
    render: (p) => (
      <Card><SettingRow label={String(p.label)} hint={String(p.hint)}><Toggle checked={Boolean(p.checked)} onChange={() => {}} label={String(p.label)} /></SettingRow></Card>
    ),
    code: (p) => `<SettingRow label="${esc(String(p.label))}" hint="${esc(String(p.hint))}">\n  <Toggle checked={${Boolean(p.checked)}} onChange={setChecked} label="${esc(String(p.label))}" />\n</SettingRow>`,
  },

  // ---------- Charts ----------
  {
    type: "DynamicChart",
    label: "Chart",
    category: "Charts",
    icon: "▅",
    imports: ["DynamicChart"],
    defaultW: 12,
    defaults: { chartType: "bar", title: "Runs per day" },
    propDefs: [
      { key: "chartType", label: "Type", type: "select", options: [{ value: "bar", label: "bar" }, { value: "horizontal_bar", label: "horizontal_bar" }, { value: "line", label: "line" }, { value: "scatter", label: "scatter" }] },
      { key: "title", label: "Title", type: "string" },
    ],
    render: (p) => {
      const data = Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i + 1}`, value: 3 + Math.round(Math.sin(i) * 2 + i * 0.4) }))
      return <DynamicChart type={p.chartType as never} title={String(p.title)} data={data} />
    },
    code: (p) => `<DynamicChart type="${esc(String(p.chartType))}" title="${esc(String(p.title))}" data={rows} />`,
  },
  {
    type: "SparklineChart",
    label: "Sparkline",
    category: "Charts",
    icon: "~",
    imports: ["SparklineChart"],
    defaultW: 3,
    defaults: {},
    propDefs: [],
    render: () => <SparklineChart data={[{ v: 8 }, { v: 11 }, { v: 9 }, { v: 13 }, { v: 12 }, { v: 15 }]} valueKey="v" width={120} height={32} />,
    code: () => `<SparklineChart data={rows} valueKey="value" width={120} height={32} />`,
  },
  {
    type: "RollingAverageChart",
    label: "Rolling Avg",
    category: "Charts",
    icon: "〰",
    imports: ["RollingAverageChart"],
    defaultW: 12,
    defaults: { title: "OPS trend", valueLabel: "OPS" },
    propDefs: [
      { key: "title", label: "Title", type: "string" },
      { key: "valueLabel", label: "Value label", type: "string" },
    ],
    render: (p) => {
      const rows = Array.from({ length: 18 }, (_, i) => ({ date: `2026-07-${String(i + 1).padStart(2, "0")}`, ops: 0.72 + Math.sin(i / 3) * 0.08 }))
      return <Card title={String(p.title)}><RollingAverageChart data={rows} valueKey="ops" valueLabel={String(p.valueLabel)} title={String(p.title)} windowSize={7} height={180} /></Card>
    },
    code: (p) => `<RollingAverageChart data={rows} valueKey="ops" valueLabel="${esc(String(p.valueLabel))}" title="${esc(String(p.title))}" windowSize={7} />`,
  },
  {
    type: "PercentileGauge",
    label: "Percentile Gauge",
    category: "Charts",
    icon: "◐",
    imports: ["PercentileGauge"],
    defaultW: 12,
    defaults: {},
    propDefs: [],
    render: () => (
      <PercentileGauge
        stats={[
          { label: "AVG", value: ".312", percentile: 78 },
          { label: "OPS", value: ".894", percentile: 84 },
          { label: "ERA", value: "2.87", percentile: 64 },
        ]}
      />
    ),
    code: () => `<PercentileGauge stats={stats} />`,
  },
]

export const REGISTRY_MAP = new Map(REGISTRY.map((d) => [d.type, d]))
export const CATEGORIES = [...new Set(REGISTRY.map((r) => r.category))]
