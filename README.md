# @mukco/ui-kit

The estate's shared UI kit. One set of components and design tokens so every
app — family hub, baseball, football, futbol, whatever comes next — looks and
behaves like the same product. The default palette is baseball's.

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
| Primitives | Card, StatCard, PercentileBar, InlineStatRow, BasicTable, DataTable + HeatPill, Tabs, NavBar, PageHeader, Drawer, ExpandableCard, CardStrip, MatchupCard, AwardCard, Avatar, SearchSelect, AutoLinkedText, DateNav, HelpTip, GlossaryTip, Loading, EmptyState, InsightsCard, Assistant, NotificationBell, UpdateToast |
| Settings | Toggle, SettingRow, TextField, SelectField, Chip, SettingsGroup (compose under PageHeader = whole page) |
| Charts | DynamicChart, RollingAverageChart, SparklineChart, PercentileGauge |
| SQL workbench | SandboxCell, SandboxChart, SandboxPivot, SandboxContext |
| Models | ModelResults, PredActualChart, ClassBreakdownChart, RunComparison, RunHistory, LayerBuilder, NNExplainer, ML_GLOSSARY |
| Sports identity | configureSports({ photoUrl, logoUrl, playerHref?, teamHref?, resolvePlayer? }), PlayerLink, TeamIcon, TeamLink |

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
