# CLAUDE.md — @mukco/ui-kit

The UI kit for template-derived estate apps (estate, baseball, football,
futbol…) — consumed as `@mukco/ui-kit` (git dep).

**Family Hub is a consumer** (2026-10-09 — the old "family-hub is its own
thing, never justify a kit change by it" rule is retired). It keeps its
System-7 look by importing `ui-components.css` (no page globals) and bridging
the kit's tokens to its own; a kit change it needs is an option that defaults
to what the template apps already get. Scope: rails-vite-template descendants
plus Family Hub. Default palette = baseball's. See README.md for the component
inventory.

## Commands

```bash
npm run dev      # playground: every component with test data, offline
npm run check    # typecheck (src + demo + playground)
npm run build    # dist/ — CI commits this to main; never commit dist by hand
                 # (scripts/build-css.mjs: ui.css, ui-components.css, phosphor.css)
```

## Non-negotiables

- **Space comes from the scale.** `--space-1` … `--space-6`, four-pixel base.
  Never pick a padding by eye: that is how a status tile ended up at 10px
  beside a Card at 16 and the whole app read as cramped.
- **Tokens only.** Components reference CSS custom properties from
  `src/ui.css` (`--surface`, `--brand`, `--stat-great`, …). Never write a hex,
  rgb(), or oklch() literal in a component. New visual concept → add a token,
  give it a default in ui.css, use it.
- **No I/O in components.** No fetch, no react-query, no router imports.
  Async edges are props (`onRun`, `fetcher`, `onSend`). The app owns its data.
  The documented exceptions are I/O *modules*, not components:
  `src/primitives/push.ts` (the push client, also the `@mukco/ui-kit/push`
  subpath) and `src/observability/` (error
  reporting, shipped only as the `@mukco/ui-kit/observability` subpath —
  never export it from `src/index.ts`). Both install nothing at import time;
  `"sideEffects": ["*.css"]` in package.json depends on every module staying
  that way.
- **No sport names** outside `src/sports/`. A "player" is fine there; a
  "batter" is not fine anywhere.
- **Playground or it didn't happen.** Every new/changed component gets a demo
  section in `demo/UiDemo.tsx` with test data (SVG data URIs for images so it
  works offline). The playground is how humans and agents audit the kit.
- **Mobile is not a mode.** Copy existing patterns: 640px breakpoint,
  44px touch targets, full-screen assistant sheet on phones, tab strips that
  scroll with an edge fade, text-size floors under 640px.
- **Dark mode via `[data-theme='dark']` tokens only** — no `.dark` variants of
  classes, no JS theme logic beyond setting the attribute.
- **Page globals are marked.** A rule that styles `html`, `body`, `*` or a
  bare element (not a `ui-*` class) goes between `/* @page-globals { */` and
  `/* } @page-globals */` in `src/ui.css`, so `ui-components.css` leaves it
  out. An unmarked one leaks into Family Hub.

## Adding a component

1. Extract from real usage in an app if you can — don't invent API surface.
2. Write it TS-strict-ish like its siblings, styled with kit classes
   (`ui-*` prefix) defined in `src/ui.css`.
3. Export it from `src/index.ts` (component + its prop types).
4. Demo section in `demo/UiDemo.tsx`.
5. `npm run check && npm run build` green.

## API signatures agents get wrong

Memorize these before writing consumer code — they are not guesses:

```tsx
<EmptyState icon="⚠">message text as children</EmptyState>   // no title prop
<Loading label="Checking…" />                                // label prop, not children
<StatCard label="OPS" value={".894"} percentile={78} />      // label+value props, never children
<Toggle checked={v} onChange={setV} label="Live scores" />
<DataTable data={rows /* T[] | null */} columns={[...]} rowKey={(r) => r.id}
           renderExpanded={(r) => …} />                      // sorting is internal
<UpdateToast localBuild={id} getRemoteBuild={async () => idOrNull} appName="Estate" />
<SortedList items={xs} getKey={(x) => x.id} onReorder={(next) => setXs(next)}
            renderItem={(x, handle) => <Row handleProps={handle} />} />
<LogStream entries={parseLogBody(body, "baseball-web") /* LogEntry[] | null */}
           footer="300 lines · written 2m ago" clampLines={6} />
<ThemeToggle />                                              // self-contained; no value/onChange pair
const { theme, resolved, setTheme } = useTheme()              // same state, for your own UI
<StatusGrid items={tiles} selected={id} />                   // tone: ok|warn|critical|unknown
<TriageList items={rows} />                                  // sorts itself, worst first
<TimeRangePicker value={id} onChange={(r) => setHours(r.hours)} />
<ListRows><ListRow tone="critical" edge title="Job" meta="queue · 3h ago"
                   mono clamp={3} detail="…" onClick={fn} /></ListRows>
<Chip onClick={fn}>a chip that opens something</Chip>
<Button tone="primary|quiet|danger" size="sm" href={url} external onClick={fn} />
```

A list of things — failures, running jobs, processes, search hits — is
`ListRow`, not a fresh set of class names each time. That is the difference
between a panel and pages that happen to share a stylesheet.

Status colour is `--sev-ok/-warn/-error/-unknown`, never `--stat-*` — that ramp
is a percentile scale where elite is red, so it paints a healthy service in the
colour of a broken one.

Styling rule reminder: apps use their own layout classes (e.g. `.muted`,
`.panel`) plus kit classes (`ui-*`). The kit ships no bare-text utility classes.

## Versioning

Consumers pin `github:mukco/ui-kit#main` while the kit is young; tags exist
for pinning when stability matters. CI pushes a dist commit after every main
merge, so `#main` installs are always buildable — unless the merge commit's
message contains the skip-CI marker. A squash merge lists every commit of the
branch, and the "Update visual baselines" workflow's commits carry that
marker, so squash-merge with a message of your own (`gh pr merge --squash
--subject … --body …`) or no dist is built (#104 and #105, 2026-10-09).
