# @mukco/ui-kit

The shared UI kit for the estate's **template-derived apps**: estate,
baseball, football, futbol, and anything else scaffolded from
rails-vite-template. One set of components and design tokens so those apps
look and behave like one product. The default palette is baseball's.

**Family Hub is deliberately not a consumer.** It is its own thing with its
own System-7 design language and its own conventions; do not add it to this
list or assume kit components belong there. One explicit exception: Family
Hub and NoFuss may import `@mukco/ui-kit/observability` (error reporting,
below) — that subpath and nothing else.

Apps install it as a git dependency:

```jsonc
// package.json
"@mukco/ui-kit": "github:mukco/ui-kit#main"
```

```ts
// main.tsx — once at boot, before anything renders
import "@mukco/ui-kit/ui.css"
```

```tsx
import { StatCard, DataTable } from "@mukco/ui-kit"
```

`dist/` is committed to `main` by CI, so installs never need a build step.
Bump by changing the ref (`#main` for latest, `#v0.x.x` tags when you want to
pin).

## What's inside

| Area | Exports |
|---|---|
| Primitives | Button, Card, StatCard, PercentileBar, InlineStatRow, BasicTable, DataTable + HeatPill, Tabs, NavBar, PageHeader, Drawer, ExpandableCard, CardStrip, MatchupCard, AwardCard, Avatar, SearchSelect, AutoLinkedText, DateNav, HelpTip, GlossaryTip, Loading, EmptyState, InsightsCard, Assistant, NotificationBell, UpdateToast, LogStream, ThemeToggle, StatusDot, StatusGrid, TriageList, TimeRangePicker, FactGrid, ListRow |
| Settings | Toggle, SettingRow, TextField, SelectField, Chip, SettingsGroup (compose under PageHeader = whole page) |
| Charts | DynamicChart, RollingAverageChart, SparklineChart, PercentileGauge |
| SQL workbench | SandboxCell, SandboxChart, SandboxPivot, SandboxContext |
| Models | ModelResults, PredActualChart, ClassBreakdownChart, RunComparison, RunHistory, LayerBuilder, NNExplainer, ML_GLOSSARY |
| Sports identity | configureSports({ photoUrl, logoUrl, playerHref?, teamHref?, resolvePlayer? }), PlayerLink, TeamIcon, TeamLink |

## Error reporting — `@mukco/ui-kit/observability`

The browser half of the estate's Rollbar-style error and log reporting. A
**subpath, never the barrel**: it does I/O, it must not pull charts or
CodeMirror into an app that only wants to report, and apps outside the kit
(Family Hub, NoFuss) import it on its own. Events go to the app's own
same-origin `POST /internal/errors` (the estate-monitor gem), which forwards
them to the estate's Errors panel.

```tsx
// main.tsx — first thing, before anything renders
import { initReporting, installChunkReload, installBootWatchdog, ErrorBoundary } from "@mukco/ui-kit/observability"

initReporting({ app: "Football", build: __BUILD_ID__, enabled: import.meta.env.PROD })
installChunkReload({ storageKey: "football-chunk-reload-at" })
installBootWatchdog({ ms: 8000, ready: () => !!document.querySelector("[data-app-ready]") })

createRoot(root).render(
  <ErrorBoundary name="app">
    <App />            {/* and <ErrorBoundary name="routes"> around the route outlet */}
  </ErrorBoundary>,
)
```

```ts
import { report, note } from "@mukco/ui-kit/observability"
report.error(err, { player: id })        // Error or message
report.warning("Lidarr refused import")  // deliberate logs, not just crashes
report.info("Imported 12 albums")
note("tap Fantasy")                      // breadcrumb; the last 20 travel with each report
```

What `initReporting` installs (nothing happens at import; before init, or with
`enabled: false`, every call is a no-op and nothing ever throws into the app):

| Capture | Level / kind | Option (default on) |
|---|---|---|
| Uncaught exceptions (`window` error) and unhandled rejections | error / `onerror`, `unhandledrejection` | — |
| A same-origin `<script>` or stylesheet that fails to load (images and other origins are ignored) | error / `chunk` | `resources` |
| `console.error` (an Error argument contributes class + stack; an Error a boundary already reported is skipped) | warning / `console` | `console` |
| `console.warn` | breadcrumb only | `console` |
| Every `fetch` / XHR → breadcrumb `GET /api/me 200 84ms` (path only, never the query string) | — | `network` |
| HTTP 5xx or a network failure (not aborts; not while offline or hidden) | warning / `network` | `network` |
| Route breadcrumbs (`pushState` / `replaceState` / `popstate`) | — | — |
| A session that died on screen (localStorage heartbeat while visible, clean on pagehide/hidden; a second open tab is asked over BroadcastChannel first) | warning / `session_died`, on the next launch | `sessionDied` |

Other options: `endpoint` (default `/internal/errors`), `source: "tv"` for the
kiosks, `ignore: RegExp[]`. Client-side limits: the same fingerprint at most 5
times per page session, 100 events per page, 50 console and 50 network reports.
Queued events go in batches of ≤ 10 by `fetch` keepalive, and by
`sendBeacon` on pagehide / going hidden.

- **`<ErrorBoundary name fallback? onReset?>`** reports kind `boundary` with the
  component stack. The default fallback ("Something went wrong", Reload, Try
  again, the message behind a small Details toggle) needs no ui.css: it reads
  the kit's tokens when present and falls back to `currentColor`, and follows
  Phosphor and light/dark. `fallback` may be a node or `({ error, reset }) => node`.
- **`installChunkReload({ storageKey })`** — a stale chunk after a deploy
  (`vite:preloadError`, or a boundary/global error matching the stale-chunk
  messages) reloads once per 30 s, timestamp in sessionStorage; a second inside
  the window is reported and shown instead of looping.
- **`installBootWatchdog({ ms, ready, onStall? })`** — reports kind `watchdog`
  when `ready()` is still false after `ms` of visible time; returns a cancel.
- `@mukco/ui-kit/observability/core` is the same minus React.

## The three rules

1. **Components read tokens, never colors.** Every visual value comes from a
   CSS custom property in `src/ui.css`. A hex or rgb() literal inside a
   component is a bug. Reskinning an app = overriding variables in one theme
   file after the kit loads.
2. **Shapes here, subjects in apps.** No routing, no data fetching, no sport
   names, no API calls. Anything async is a prop (`onRun`, `fetcher`,
   `getRemoteBuild`). If a component needs the network, the design is wrong.
3. **The playground is the spec.** `npm run dev` renders every component with
   test data offline. New components land with a demo section or they didn't
   happen.

## Developing the kit

```bash
npm install
npm run dev      # playground on :5173-ish, all components with test data
npm run check    # tsc over src + demo + playground
npm run build    # dist/ (tsc emit + ui.css copy)
```

Dark mode is attribute-driven: set `data-theme="dark"` on `<html>`.
Mobile behavior is baked in: 640px breakpoint, full-screen assistant sheet,
edge-fade tab strips, micro-text floors, safe-area insets.
