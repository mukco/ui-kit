import { useState } from "react"
import {
  Assistant,
  AwardCard,
  AutoLinkedText,
  Avatar,
  BasicTable,
  Button,
  Card,
  CardStrip,
  Chip,
  DataTable,
  DateNav,
  Drawer,
  DynamicChart,
  EmptyState,
  ExpandableCard,
  FactGrid,
  FloatingAssistant,
  HelpTip,
  InlineStatRow,
  InsightsCard,
  Loading,
  ListRow,
  ListRows,
  LogStream,
  parseLogBody,
  MatchupCard,
  ModelResults,
  NavBar,
  NotificationBell,
  PageHeader,
  PercentileGauge,
  PlayerLink,
  RollingAverageChart,
  SandboxCell,
  SandboxChart,
  SearchSelect,
  SectionLabel,
  SegmentedControl,
  SelectField,
  SortedList,
  SettingRow,
  SettingsGroup,
  SparklineChart,
  StatCard,
  Tabs,
  ThemeToggle,
  TimeRangePicker,
  TriageList,
  StatusDot,
  StatusGrid,
  TeamIcon,
  TeamLink,
  TextField,
  Toggle,
  UpdateToast,
  configureSports,
  ordinal,
  type ChartRow,
} from "../src"
import "./demo.css"

/* ---------- Offline test identity: SVG data URIs, no network needed. ---------- */

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/* A docker-shaped trail: RFC 3339 stamps, mixed formats, one very long line
   so the fold has something to fold, and a warning and an error for the ramp. */
/* An estate mid-wobble: two things fine, one slow, one refusing, one silent. */
const DEMO_TILES = [
  { id: "hub", name: "Family Hub", tone: "ok" as const, metric: "12ms",
    series: [{ v: 11 }, { v: 13 }, { v: 12 }, { v: 14 }, { v: 12 }], seriesKey: "v" },
  { id: "baseball", name: "Baseball", tone: "ok" as const, metric: "18ms",
    series: [{ v: 19 }, { v: 17 }, { v: 18 }, { v: 18 }, { v: 17 }], seriesKey: "v" },
  { id: "push", name: "Push", tone: "warn" as const, metric: "410ms", detail: "workers stale 14m",
    series: [{ v: 40 }, { v: 90 }, { v: 210 }, { v: 380 }, { v: 410 }], seriesKey: "v" },
  { id: "nofuss", name: "NoFuss", tone: "critical" as const, metric: "—", detail: "no answer" },
  { id: "gateway", name: "gateway", tone: "unknown" as const, detail: "not reporting" },
]

const DEMO_TRIAGE = [
  { id: "t1", severity: "warn" as const, title: "Push · workers stale",
    detail: "Last heartbeat 14 minutes ago; the queue is still accepting.",
    at: new Date(Date.now() - 14 * 60_000).toISOString(),
    action: { label: "Open", onClick: () => {} } },
  { id: "t2", severity: "critical" as const, title: "NoFuss stopped answering",
    detail: "nofuss.edwardsfamily.app refused three checks in a row.",
    at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    action: { label: "Open", onClick: () => {} } },
  { id: "t3", severity: "ok" as const, title: "Certificate renewed",
    detail: "hub.edwardsfamily.app now expires in 89 days.",
    at: new Date(Date.now() - 26 * 3600_000).toISOString() },
]

const DEMO_LOG_BODY = [
  "2026-08-25T02:10:58.114Z Started GET \"/api/metrics\" for 10.0.0.4 at 2026-08-25 02:10:58 +0000",
  "2026-08-25T02:10:58.402Z Completed 200 OK in 288ms (Views: 1.1ms | ActiveRecord: 12.4ms)",
  "2026-08-25T02:11:02.001Z [Feeds::Fetch] warning: espn.com refused a direct request, retrying through FEED_PROXY_URL",
  "2026-08-25T02:11:44.771Z Error performing Feeds::FetchJob (Job ID: 4c1f-9a02) from SolidQueue(feeds) in 30021.4ms: Net::ReadTimeout with #<TCPSocket:(closed)> (Net::ReadTimeout) — /rails/app/services/feeds/fetch.rb:71:in `block in call` /rails/app/services/feeds/fetch.rb:68:in `each` /rails/app/jobs/feeds/fetch_job.rb:12:in `perform` /usr/local/bundle/gems/activejob-8.1.0/lib/active_job/execution.rb:69:in `block in perform_now`",
  "2026-08-25T02:11:45.010Z SolidQueue-1.2.1 Claimed 3 jobs from queue default",
  "no timestamp on this one — an app printing straight to stdout",
  "2026-08-25T02:12:00.500Z Completed 200 OK in 43ms (Views: 0.4ms | ActiveRecord: 3.1ms)",
].join("\n")

const DEMO_COLORS = ["#1e66e4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6"]

function demoPhoto(id: string | number | null | undefined, size = 80): string {
  const seed = String(id ?? 0)
  const color = DEMO_COLORS[hash(seed) % DEMO_COLORS.length]
  const initials = seed.slice(-2).toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(size / 2.6)}" font-weight="700" fill="#fff">${initials}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function demoLogo(teamId: string | number): string {
  const seed = String(teamId)
  const color = DEMO_COLORS[hash(seed) % DEMO_COLORS.length]
  const letter = seed[0]?.toUpperCase() ?? "?"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="${color}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="800" fill="#fff">${letter}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

configureSports({
  photoUrl: demoPhoto,
  logoUrl: demoLogo,
  playerHref: (id) => `#player-${id}`,
  teamHref: (teamId) => `#team-${teamId}`,
  resolvePlayer: async (name) => ({ id: `resolved-${name.split(" ")[0]}` }),
})

/* ---------- Test data ---------- */

const barData: ChartRow[] = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 19 },
  { name: "Wed", value: 7 },
  { name: "Thu", value: 15 },
  { name: "Fri", value: 22 },
  { name: "Sat", value: 9 },
  { name: "Sun", value: 17 },
]

const hbarData: ChartRow[] = [
  { name: "Walks", value: 48 },
  { name: "Strikeouts", value: 91 },
  { name: "Homers", value: 23 },
  { name: "Stolen bases", value: 12 },
]

const scatterData: ChartRow[] = Array.from({ length: 24 }, (_, i) => ({
  name: `P${i + 1}`,
  speed: 88 + ((i * 7) % 15),
  break: 2 + ((i * 5) % 9),
}))

function gameLog(): ChartRow[] {
  let v = 0.72
  return Array.from({ length: 28 }, (_, i) => {
    v = Math.min(1.25, Math.max(0.45, v + (Math.sin(i * 2.7) + Math.cos(i * 1.3)) * 0.045))
    return { date: `2026-07-${String((i % 30) + 1).padStart(2, "0")}`, opponent: ["RIV", "NOR", "EAS", "WEST"][i % 4], isHome: i % 2 === 0, ops: Number(v.toFixed(3)) }
  })
}

const PLAYERS = [
  { id: "p101", name: "Ava Martinez" },
  { id: "p102", name: "Ben Okafor" },
  { name: "Cleo Nguyen" }, // no id → resolves through resolvePlayer
]

const DEMO_PLAYERS = [
  { name: "Ava Martinez", pos: "SP" },
  { name: "Ben Okafor", pos: "CF" },
  { name: "Cleo Nguyen", pos: "SS" },
  { name: "Dmitri Volkov", pos: "C" },
  { name: "Esperanza Diaz", pos: "1B" },
]

const TEAMS: Array<[string, string]> = [
  ["north", "Northside"],
  ["east", "Eastgate"],
  ["west", "Westend"],
]

const TEAM_STATS = [
  { name: "Northside", ops: 0.812, era: 3.42, runs: 412, errors: 38 },
  { name: "Riverton", ops: 0.744, era: 4.01, runs: 377, errors: 52 },
  { name: "Eastgate", ops: 0.69, era: 3.88, runs: 341, errors: 61 },
  { name: "Westend", ops: 0.755, era: 3.15, runs: 395, errors: 44 },
]

const DEMO_NOTIFS = [
  { id: "n1", icon: "⚾", title: "Final: Northside 6–4 Riverton", body: "HR: Ben Okafor (12)", time: "2h ago" },
  { id: "n2", icon: "🤖", title: "Weekly insights ready", time: "Yesterday" },
]

const SB_COLUMNS = ["name", "season", "games", "rating"]
const SB_ROWS: unknown[][] = Array.from({ length: 60 }, (_, i) => [
  ["A. Martinez", "B. Okafor", "C. Nguyen"][i % 3],
  2021 + (i % 5),
  40 + ((i * 7) % 60),
  Number((6 + Math.sin(i * 1.7) * 2 + (i % 5) * 0.4).toFixed(2)),
])

// FloatingAssistant: the same mention list DEMO_PLAYERS/TEAMS already model,
// reshaped to the kit's generic {id, name, kind} — a real app's mentionSearch
// would hit its own player/team search endpoints instead.
const FA_MENTIONABLES = [
  ...DEMO_PLAYERS.map((p) => ({ id: p.name, name: p.name, kind: "player" })),
  ...TEAMS.map(([id, name]) => ({ id, name, kind: "team" })),
]

async function faMentionSearch(query: string) {
  const q = query.toLowerCase()
  return FA_MENTIONABLES.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6)
}

// Stands in for `onAsk`: a real app calls its own API here. Echoes the
// question back, and demonstrates the chart/sql seams on request so the
// panel's chart card and "Load in Sandbox" button have something to show.
async function faOnAsk(question: string, context: any) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const q = question.toLowerCase()
  if (q.includes("chart")) {
    return { answer: "Here's the same rolling data as the chart demo above.", charts: [{ type: "bar", title: "Runs per day", data: barData, xKey: "name", yKey: "value" }] }
  }
  if (q.includes("sql")) {
    return { answer: "```sql\nSELECT name, ops FROM batters ORDER BY ops DESC LIMIT 10\n```" }
  }
  return { answer: `Echoing test data for "${question}" on a ${context.pageType} page. A real app would call its API here.` }
}

function faDeriveContext(pathname: string) {
  return { pageType: pathname.replace(/^\//, "") || "today" }
}

// Reuses .ui-fa-md-p — the kit ships that class for exactly this: an app's
// renderMarkdown gets to draw on the same visual language as the panel around
// it. A real app would hand this to react-markdown's `components` instead of
// splitting on newlines.
function faRenderMarkdown(text: string) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i} className="ui-fa-md-p">{line || " "}</p>
      ))}
    </>
  )
}

function faRenderChart(chart: any) {
  return <DynamicChart type={chart.type} title={chart.title} data={chart.data} xKey={chart.xKey} yKey={chart.yKey} height={160} />
}

const DEMO_RUN = {
  result: {
    model_type: "neural_network",
    task: "regression" as const,
    target: "final rating",
    metrics: { r2: 0.872, rmse: 2.31, mae: 1.78 },
    parameter_count: 451,
    architecture: "12 → [64 relu] → [32 relu] → 1",
    train_samples: 800,
    test_samples: 200,
    training_time_ms: 2140,
    loss_history: Array.from({ length: 30 }, (_, e) => +(4 * Math.exp(-e / 6) + 0.35 + Math.random() * 0.05).toFixed(3)),
    feature_importance: [
      { feature: "prior_rating", importance: 0.42 },
      { feature: "minutes", importance: 0.23 },
      { feature: "age", importance: 0.14 },
      { feature: "team_strength", importance: 0.11 },
      { feature: "rest_days", importance: 0.06 },
      { feature: "home_rate", importance: 0.04 },
    ],
    test_predictions: {
      sampled: true,
      y_true: Array.from({ length: 50 }, (_, i) => +(10 + Math.sin(i / 3) * 6 + (i % 7) * 0.8).toFixed(2)),
      y_pred: Array.from({ length: 50 }, (_, i) => +(10 + Math.sin(i / 3) * 6 + (i % 7) * 0.8 + ((i % 11) - 5) * 0.55).toFixed(2)),
    },
  },
}

/* ---------- Page ---------- */

export function UiDemo() {
  const [tab, setTab] = useState("summary")
  const [statView, setStatView] = useState("season")
  const [drawer, setDrawer] = useState(false)
  const [picked, setPicked] = useState<{ name: string; pos: string } | null>(null)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Ask me about last night's games." },
  ])
  const [busy, setBusy] = useState(false)
  const [faSandboxSql, setFaSandboxSql] = useState<string | null>(null)
  const [liveScores, setLiveScores] = useState(true)
  const [team, setTeam] = useState("north")
  const [name, setName] = useState("")
  const [demoDate, setDemoDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [deployed, setDeployed] = useState(false)
  const [range, setRange] = useState("6h")
  const [tile] = useState<string | null>("push")
  const [sections, setSections] = useState(["Recurring", "Queues", "Failures", "Notes"])

  const log = gameLog()

  return (
    <div className="uidemo">
      <NavBar
        brand="⚾ Kit"
        items={[
          { label: "Today", href: "#", active: true },
          {
            label: "Research",
            children: [
              { label: "Leaderboards", href: "#" },
              { label: "Projections", href: "#" },
              { label: "Sandbox", onClick: () => setDrawer(true) },
            ],
          },
          {
            label: "News",
            children: [
              { label: "Top stories", href: "#" },
              { label: "Transactions", href: "#" },
            ],
          },
          { label: "Settings", onClick: () => {} },
        ]}
        right={<><NotificationBell items={DEMO_NOTIFS} onDismissAll={() => {}} /><Avatar name="Kit Viewer" src={demoPhoto("kv")} size={28} /></>}
      />

      <header className="uidemo-header">
        <h1>UI kit playground</h1>
        <ThemeToggle />
      </header>
      <p className="uidemo-note">
        Every component renders from tokens in <code>src/ui.css</code> — the toggle writes{" "}
        <code>data-theme</code> onto &lt;html&gt; and remembers the choice, nothing else. “Auto”
        follows the system. Data fetching is never in the kit; everything here is
        static test data.
      </p>

      <section className="uidemo-section">
        <h2>PageHeader · Tabs · Drawer</h2>
        <PageHeader
          title="Season summary"
          subtitle="Week 14 · through Tuesday"
          onBack={() => history.back()}
          actions={<button className="uidemo-toggle">Share</button>}
        />
        <Tabs
          tabs={[
            { id: "summary", label: "Summary" },
            { id: "splits", label: "Splits" },
            { id: "log", label: "Game log" },
            { id: "vs", label: "vs opponents" },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="uidemo-toggle" onClick={() => setDrawer(true)}>
            Open drawer
          </button>
          <span className="uidemo-note">active tab: {tab}</span>
        </div>
        <Drawer open={drawer} onClose={() => setDrawer(false)} side="right" label="Filters">
          <PageHeader title="Filters" actions={<button className="uidemo-toggle" onClick={() => setDrawer(false)}>Done</button>} />
          <p className="uidemo-note">Anything can live in a drawer: filters, settings, lineups.</p>
        </Drawer>
      </section>

      <section className="uidemo-section">
        <h2>SectionLabel · SegmentedControl — the inside of a card, not the page</h2>
        <div className="uidemo-grid">
          <Card>
            <SectionLabel
              action={
                <SegmentedControl
                  options={[
                    { id: "season", label: "Season" },
                    { id: "l5", label: "L5" },
                  ]}
                  active={statView}
                  onChange={setStatView}
                />
              }
            >
              Rushing
            </SectionLabel>
            <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
              Showing {statView === "season" ? "full-season" : "last 5 games"} totals. {ordinal(3)} in the league.
            </p>
          </Card>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Matchup cards (games, series, trivia weeks)</h2>
        <div className="uidemo-grid">
          <MatchupCard
            away={{ name: "Riverton", logoUrl: demoLogo("RIV"), score: 4 }}
            home={{ name: "Northside", logoUrl: demoLogo("NOR"), score: 6 }}
            status="Final"
            tone="final"
            detail="WP: Ava Martinez · HR: Ben Okafor (12)"
          />
          <MatchupCard
            away={{ name: "Eastgate", logoUrl: demoLogo("EAS") }}
            home={{ name: "Westend", logoUrl: demoLogo("WES") }}
            status="7:05 PM"
            tone="upcoming"
          />
          <MatchupCard
            away={{ name: "Riverton", logoUrl: demoLogo("RIV"), score: 3 }}
            home={{ name: "Eastgate", logoUrl: demoLogo("EAS"), score: 3 }}
            status="Live"
            tone="live"
            detail="Top 8th"
          />
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Awards</h2>
        <div className="uidemo-grid">
          <AwardCard icon="🏆" label="Most valuable player" winner={<PlayerLink player={{ id: "p101", name: "Ava Martinez" }} avatarOnly />} detail=".312 / 23 HR / .894 OPS" />
          <AwardCard icon="🥇" label="Trivia champion" winner="Cleo Nguyen" detail="9 of 10 correct" />
          <AwardCard icon="🔥" label="Hottest streak" winner={<PlayerLink player={{ id: "p102", name: "Ben Okafor" }} avatarOnly />} detail="12 games with a hit" />
        </div>
      </section>

      <section className="uidemo-section">
        <h2>AI insights card</h2>
        <InsightsCard
          cached
          model="gpt-5-nano-2025-08-07"
          onRegenerate={() => {}}
          sections={[
            {
              heading: "What changed",
              footer: <span className="ui-chip">Ava Martinez</span>,
              bullets: [
                "Ava Martinez raised her rolling OPS from .781 to .894 over her last 10 games.",
                "Riverton's bullpen has thrown the most innings in the league this month.",
              ],
            },
            {
              heading: "Worth watching",
              bullets: ["Tonight's start vs Eastgate pits the top two run defenses against each other."],
            },
          ]}
        />
      </section>

      <section className="uidemo-section">
        <h2>Search select</h2>
        <Card>
          <SearchSelect
            value={picked}
            onChange={setPicked}
            fetcher={async (q) =>
              DEMO_PLAYERS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
            }
            getLabel={(p) => p.name}
            getHint={(p) => p.pos}
            placeholder="Search players…"
          />
          <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
            The fetcher prop is yours to point at any endpoint.
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>Assistant shell</h2>
        <Card>
          <p className="uidemo-note">
            Fixed launcher bottom-right of this page →. The app supplies messages and an onSend;
            the kit draws the conversation.
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>FloatingAssistant — draggable, resizable, its own window (bottom-right launcher)</h2>
        <Card>
          <p className="uidemo-note">
            Baseball's chat panel, promoted: drag the header, resize the left/bottom/corner
            grips, minimise back to a bubble — position, size and opacity persist per{" "}
            <code>storagePrefix</code>. Ask about "chart" or "sql" to see <code>renderChart</code>{" "}
            and the built-in "Load in Sandbox" action; type <code>@</code> for the mention demo.
            Everything async — <code>onAsk</code>, <code>mentionSearch</code> — is test data here.
          </p>
          {faSandboxSql && (
            <p className="uidemo-note">onOpenSandbox received: <code>{faSandboxSql}</code></p>
          )}
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>StatCard variants</h2>
        <div className="uidemo-grid">
          <StatCard label="Batting avg" value=".312" percentile={78} />
          <StatCard label="ERA" value="2.87" percentile={64} invert subtitle="lower is better" />
          <StatCard label="Pull %" value="41.2" percentile={51} neutral />
          <StatCard
            label="Home runs"
            value={23}
            progress={{ current: 23, target: 34 }}
            comparison={{ projectedLabel: "vs projection", status: "+3 ahead", color: "var(--ok)" }}
          />
          <StatCard label="Strikeouts" value={91} comparison={{ projectedLabel: "vs projection", status: "-8 behind", color: "var(--danger)" }} />
          <StatCard label="No data" value={null} />
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Inline stats · Avatars · Help tip</h2>
        <Card>
          <InlineStatRow
            stats={[
              { label: "OPS", value: ".894" },
              { label: "HR", value: 23 },
              { label: "RBI", value: 77 },
              { label: "SB", value: 12 },
              { label: "BB%", value: "11.4%" },
            ]}
          />
          <div className="uidemo-row" style={{ marginTop: "1rem" }}>
            <Avatar name="Ada Lovelace" src={demoPhoto("ad")} size={40} />
            <Avatar name="Grace Hopper" size={40} />
            <Avatar name={null} src={null} size={40} />
            <Avatar name="Tiny" size={20} />
            <Avatar name="Huge" size={56} />
            <span>
              What is OPS? <HelpTip>On-base plus slugging. Sums reach-base rate and power into one hitting number.</HelpTip>
            </span>
          </div>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>Loading & empty states</h2>
        <div className="uidemo-grid">
          <Card>
            <Loading label="Fetching box score…" />
          </Card>
          <Card>
            <EmptyState icon="⚾">No games today. Check back tomorrow.</EmptyState>
          </Card>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Sports identity</h2>
        <Card>
          <div className="uidemo-row">
            {PLAYERS.map((p) => (
              <PlayerLink key={p.name} player={p} />
            ))}
          </div>
          <div className="uidemo-row" style={{ marginTop: "0.75rem" }}>
            {TEAMS.map(([id, name]) => (
              <TeamLink key={id} teamId={id} name={name} />
            ))}
          </div>
          <div className="uidemo-row" style={{ marginTop: "0.75rem" }}>
            {TEAMS.map(([id]) => (
              <TeamIcon key={id} teamId={id} size={32} />
            ))}
            <span className="uidemo-note">photos/logos come from configureSports(), not the kit</span>
          </div>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>DynamicChart — every type</h2>
        <div className="uidemo-charts">
          <Card title="Bar">
            <DynamicChart type="bar" title="Runs per day" data={barData} xKey="name" yKey="value" height={180} />
          </Card>
          <Card title="Horizontal bar">
            <DynamicChart type="horizontal_bar" title="Counting stats" data={hbarData} xKey="name" yKey="value" height={180} />
          </Card>
          <Card title="Line">
            <DynamicChart type="line" title="Team runs, rolling week" data={barData} xKey="name" yKey="value" height={180} />
          </Card>
          <Card title="Scatter">
            <DynamicChart type="scatter" title="Speed vs break" data={scatterData} xKey="speed" yKey="break" height={180} />
          </Card>
          <Card title="Empty state">
            <DynamicChart type="bar" title="Nothing yet" data={[]} xKey="name" yKey="value" />
          </Card>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>RollingAverageChart</h2>
        <div className="uidemo-charts">
          <Card title="With inline header">
            <RollingAverageChart data={log} valueKey="ops" valueLabel="OPS" title="OPS trend" windowSize={7} reference={0.75} height={200} />
          </Card>
          <Card title="Floating chip + custom format">
            <RollingAverageChart
              data={log}
              valueKey="ops"
              valueLabel="OPS"
              windowSize={10}
              formatValue={(v) => `${(v * 100).toFixed(0)}`}
              height={200}
            />
          </Card>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>DataTable — sort, heat pills, expandable rows</h2>
        <DataTable
          data={TEAM_STATS}
          rowKey={(r) => r.name}
          columns={[
            { key: "name", label: "Team", render: (r) => r.name },
            { key: "ops", label: "OPS", lowIsBetter: false, fmt: (v) => Number(v).toFixed(3) },
            { key: "era", label: "ERA", lowIsBetter: true, fmt: (v) => Number(v).toFixed(2) },
            { key: "runs", label: "R", align: "right" },
            { key: "errors", label: "E", lowIsBetter: true, align: "right" },
          ]}
          renderExpanded={(r) => (
            <InlineStatRow
              stats={[
                { label: "Home", value: `${r.runs - 40}–${r.runs - 50}` },
                { label: "Away", value: "12–9" },
                { label: "Run diff", value: `+${r.runs - 52}` },
                { label: "Last 10", value: "7–3" },
              ]}
            />
          )}
        />
      </section>

      <section className="uidemo-section">
        <h2>Expandable cards · Card strip</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <ExpandableCard title="Pitching staff" subtitle="5 starters · 9 relievers">
            <InlineStatRow
              stats={[
                { label: "ERA", value: "3.42" },
                { label: "WHIP", value: "1.18" },
                { label: "K/9", value: "8.9" },
              ]}
            />
          </ExpandableCard>
          <ExpandableCard title="Injury report" subtitle="2 players" defaultOpen-hint="">
            <p className="uidemo-note">Body content. Controlled via open/onToggle if the app wants ownership.</p>
          </ExpandableCard>
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <CardStrip>
            {TEAMS.map(([id, name]) => (
              <MatchupCard
                key={id}
                away={{ name, logoUrl: demoLogo(id), score: 3 }}
                home={{ name: "Riverton", logoUrl: demoLogo("RIV"), score: 4 }}
                status="Final"
                tone="final"
              />
            ))}
          </CardStrip>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Settings vocabulary</h2>
        <Card>
          <SettingRow label="Live scores" hint="Refresh automatically while games are on">
            <Toggle checked={liveScores} onChange={setLiveScores} label="Live scores" />
          </SettingRow>
          <SettingRow label="Favorite team" hint="Drives the dashboard header">
            <SelectField
              value={team}
              onChange={setTeam}
              options={TEAMS.map(([id, name]) => ({ value: id, label: name }))}
            />
          </SettingRow>
          <SettingRow label="Display name">
            <TextField value={name} onChange={setName} placeholder="Your name" />
          </SettingRow>
          <SettingRow label="Data feeds" hint="Freshness of upstream imports">
            <span style={{ display: "inline-flex", gap: "0.375rem" }}>
              <Chip tone="ok">Live</Chip>
              <Chip tone="stale">Stale</Chip>
              <Chip tone="muted">Cached</Chip>
            </span>
          </SettingRow>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>BasicTable · DateNav · Sparklines</h2>
        <BasicTable
          showSummary
          columns={["name", "team", "gp", "pts"]}
          rows={[
            ["Ava Martinez", "NOR", 22, 187],
            ["Ben Okafor", "EAS", 24, 203],
            ["Cleo Nguyen", "WEST", 19, null],
            ["Dmitri Volkov", "NOR", 25, 164],
            ["Esperanza Diaz", "RIV", 21, 158],
          ]}
        />
        <div className="uidemo-row" style={{ marginTop: "0.75rem", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}>
          <DateNav date={demoDate} onChange={setDemoDate} disableFuture />
          <span className="uidemo-row">
            <SparklineChart data={[{ v: 3 }, { v: 5 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 9 }]} valueKey="v" width={70} />
            <SparklineChart data={[{ v: 9 }, { v: 7 }, { v: 8 }, { v: 4 }, { v: 5 }, { v: 2 }]} valueKey="v" color="var(--danger)" width={70} />
            <SparklineChart data={[{ v: 1 }, { v: 2 }, { v: 3 }, { v: 3 }, { v: 4 }]} valueKey="v" color="var(--ok)" width={70} />
          </span>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Percentile gauge · AutoLinkedText</h2>
        <Card>
          <PercentileGauge
            stats={[
              { label: "Scoring", value: "28.4", percentile: 92, category: "Offense" },
              { label: "Assists", value: "6.1", percentile: 71, category: "Offense" },
              { label: "Rebounds", value: "4.2", percentile: 33 },
              { label: "Turnovers", value: "1.8", percentile: 78, neutral: true },
            ]}
          />
        </Card>
        <Card>
          <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
            <AutoLinkedText
              text="Ava Martinez scored 31 points on 12/18 shooting while Ben Okafor added 24 in the Northside win over Eastgate."
              players={[
                { name: "Ava Martinez", id: "p101" },
                { name: "Ben Okafor", id: "p102" },
              ]}
              renderPlayerLink={(name, id) => (
                <a href={`#player-${id}`} style={{ color: "var(--brand-light)" }}>{name}</a>
              )}
              links={[{ name: "Northside", href: "#team-north" }, { name: "Eastgate", href: "#team-east" }]}
            />
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>SQL workbench — SandboxChart · SandboxCell (mock query)</h2>
        <Card title="SandboxChart over test rows">
          <SandboxChart columns={SB_COLUMNS} rows={SB_ROWS} />
        </Card>
        <div style={{ marginTop: "0.75rem" }}>
          <SandboxCell
            cell={{ id: "c1", type: "sql", sql: "SELECT name, season, war FROM batters LIMIT 200", title: "WAR by season" }}
            index={0}
            onRun={async () => ({ columns: SB_COLUMNS, rows: SB_ROWS, rowCount: SB_ROWS.length, runtimeMs: 42 })}
            onUpdateSql={() => {}}
          />
        </div>
      </section>

      <section className="uidemo-section">
        <h2>Button — the one the kit never had</h2>
        <Card>
          <div className="uidemo-row">
            <Button tone="primary">Refresh</Button>
            <Button>Open</Button>
            <Button tone="danger">Switch off</Button>
            <Button disabled>Not yet</Button>
            <Button size="sm">Small</Button>
            <Button href="https://github.com" external size="sm">Run</Button>
            <Button icon title="Search">⌕</Button>
            <Button icon title="Sign out">⏻</Button>
          </div>
          <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
            Every app had invented its own — <code>.btn</code>, <code>.mac-btn</code>,
            <code>.ui-triage-action</code> — which is why actions looked like they came from
            different applications. An action with an href renders as a link, because one that
            goes somewhere should be openable in a new tab. The last two are icon buttons — a
            toolbar is mostly these, and without the idiom a search, a bell and a sign-out end up
            three different shapes in a row.
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>ListRow — one thing in a list of things</h2>
        <Card>
          <ListRows>
            <ListRow
              tone="critical"
              edge
              title="Feeds::FetchJob"
              meta="feeds · 14h ago"
              mono
              clamp={3}
              detail="Net::ReadTimeout: execution expired reading espn.com after 30s — /rails/app/services/feeds/fetch.rb:71:in `block in call` /rails/app/jobs/feeds/fetch_job.rb:12:in `perform` /usr/local/bundle/gems/activejob-8.1.0/lib/active_job/execution.rb:69"
            />
            <ListRow tone="ok" pulse title="Dinner::SweepJob" meta="default · for 41m" />
            <ListRow
              tone="warn"
              edge
              title="baseball-web"
              meta="4 restarts"
              detail="Up 3 hours"
            />
            <ListRow
              title="family-hub-web"
              meta="02:11:44"
              mono
              clamp={2}
              detail="Completed 500 Internal Server Error in 288ms (Views: 1.1ms | ActiveRecord: 12.4ms)"
              onClick={() => {}}
            />
            <ListRow
              tone="ok"
              edge
              leading={<Avatar name="Jonathan Taylor" size={32} />}
              title="Jonathan Taylor"
              meta="RB · IND"
              detail="Best value at your slot — the tier below empties in 6 picks."
              trailing={<Button tone="primary" size="sm">Assign</Button>}
            />
            <ListRow
              leading={<Avatar name="Chris Olave" size={32} />}
              title="Chris Olave"
              meta="WR · NO"
              trailing={<Button size="sm">Assign</Button>}
            />
          </ListRows>
          <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
            Estate had hand-rolled this four times — failed jobs, running jobs, worker processes
            and log hits — each with its own truncation rule. The last row is a door. The bottom
            two show <code>leading</code>/<code>trailing</code>: an avatar and an action button
            that center on the whole row, unlike the tone dot, which sits at the title's baseline.
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>FactGrid — what a thing is</h2>
        <Card>
          <FactGrid
            facts={[
              { label: "Image", value: "ghcr.io/mukco/estate/baseball:latest", mono: true },
              { label: "Container", value: "baseball-web", mono: true },
              { label: "Shipped by", value: "CI, on merge to main" },
              { label: "Repo", value: "mukco/baseball" },
              { label: "Nothing here", value: null },
            ]}
          />
          <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
            A null value drops its row entirely — a blank row is worse than none. Narrow the
            window and the labels move above their values.
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>StatusGrid · TriageList · TimeRangePicker — a monitoring screen</h2>
        <Card>
          <div className="uidemo-row" style={{ justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <strong style={{ fontSize: "0.9rem" }}>The estate</strong>
            <TimeRangePicker value={range} onChange={(r) => setRange(r.id)} />
          </div>
          <StatusGrid items={DEMO_TILES} selected={tile} />
          <p className="uidemo-note" style={{ margin: "0.75rem 0 0.4rem" }}>
            Worst first, and sorted by the component — a triage list ordered any other way
            is not a triage list.
          </p>
          <TriageList items={DEMO_TRIAGE} />
          <p className="uidemo-note" style={{ marginTop: "0.75rem" }}>
            Nothing wrong looks like this:
          </p>
          <TriageList items={[]} />
        </Card>
        <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
          Severity is painted from <code>--sev-*</code>, never <code>--stat-*</code> — that ramp is a
          percentile scale where elite is red. Every dot carries a hidden word, so colour is
          never the only carrier. Range: {range}.
        </p>
        <div className="uidemo-row" style={{ marginTop: "0.75rem", alignItems: "center" }}>
          <StatusDot tone="ok" pulse /> healthy
          <StatusDot tone="warn" /> needs a look
          <StatusDot tone="critical" /> broken
          <StatusDot tone="unknown" /> not reporting
        </div>
      </section>

      <section className="uidemo-section">
        <h2>LogStream — a container's trail</h2>
        <Card>
          <LogStream
            entries={parseLogBody(DEMO_LOG_BODY, "baseball-web")}
            footer="8 lines · written 2m ago · the host keeps a day"
          />
        </Card>
        <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
          Narrow the window under 640px: the height cap comes off so the page is the only
          scroll surface, the stamp moves above the message, and “No wrap” disappears.
        </p>
        <div className="uidemo-grid" style={{ marginTop: "0.75rem" }}>
          <Card title="Loading">
            <LogStream entries={null} />
          </Card>
          <Card title="Empty">
            <LogStream entries={[]} />
          </Card>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>ML suite — ModelResults with a regression run</h2>
        <ModelResults results={DEMO_RUN.result} />
      </section>

      <section className="uidemo-section">
        <h2>Settings page — composed</h2>
        <PageHeader title="Settings" subtitle="Applies to this device only" />
        <div className="uidemo-section" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <SettingsGroup title="Preferences" description="How the app looks and behaves for you">
            <SettingRow label="Live scores" hint="Refresh automatically while games are on">
              <Toggle checked={liveScores} onChange={setLiveScores} label="Live scores" />
            </SettingRow>
            <SettingRow label="Favorite team" hint="Drives the dashboard header">
              <SelectField value={team} onChange={setTeam} options={TEAMS.map(([id, name]) => ({ value: id, label: name }))} />
            </SettingRow>
            <SettingRow label="Display name">
              <TextField value={name} onChange={setName} placeholder="Your name" />
            </SettingRow>
          </SettingsGroup>
          <SettingsGroup title="Data feeds" description="Freshness of upstream imports">
            <SettingRow label="Feed status">
              <span style={{ display: "inline-flex", gap: "0.375rem" }}>
                <Chip tone="ok">Live</Chip>
                <Chip tone="stale">Stale</Chip>
                <Chip tone="muted">Cached</Chip>
              </span>
            </SettingRow>
          </SettingsGroup>
        </div>
      </section>

      <section className="uidemo-section">
        <h2>SortedList — drag the handles</h2>
        <Card>
          <SortedList
            items={["Recurring", "Queues", "Failures", "Notes"]}
            getKey={(x) => x}
            onReorder={setSections}
            renderItem={(label, handle) => (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button type="button" {...handle} className="ui-iconbtn" aria-label={`Reorder ${label}`}>⠿</button>
                <span>{label}</span>
              </div>
            )}
          />
          <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
            Order: {sections.join(" → ")} · same handle contract SandboxCell accepts.
          </p>
        </Card>
      </section>

      <section className="uidemo-section">
        <h2>Update toast</h2>
        <Card>
          <button className="uidemo-toggle" onClick={() => setDeployed(true)}>
            Simulate a deploy
          </button>
          <p className="uidemo-note" style={{ marginTop: "0.5rem" }}>
            Polls getRemoteBuild() every 5 min + on tab focus; here it flips immediately.
          </p>
        </Card>
      </section>

      <UpdateToast
        localBuild="demo-1"
        getRemoteBuild={async () => (deployed ? "demo-2" : "demo-1")}
        appName="the kit"
      />

      <Assistant
        title="Ask the kit"
        launcher="✨"
        messages={messages}
        busy={busy}
        onSend={(text) => {
          setMessages((m) => [...m, { role: "user", content: text }])
          setBusy(true)
          setTimeout(() => {
            setMessages((m) => [...m, { role: "assistant", content: `Echoing test data: “${text}”. A real app would call its API here.` }])
            setBusy(false)
          }, 700)
        }}
      />

      <FloatingAssistant
        title="Kit Assistant"
        welcome="Ask me anything about this playground."
        storagePrefix="kitdemo-assistant"
        pathname="/demo"
        deriveContext={faDeriveContext}
        onAsk={faOnAsk}
        mentionSearch={faMentionSearch}
        renderMarkdown={faRenderMarkdown}
        renderChart={faRenderChart}
        messageActions={() => (
          <button type="button" className="ui-fa-obsidian-btn" onClick={() => {}}>
            Pin
          </button>
        )}
        onOpenSandbox={(sql) => setFaSandboxSql(sql)}
      />
    </div>
  )
}
