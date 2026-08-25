# CLAUDE.md — @mukco/ui-kit

The UI kit for template-derived estate apps (estate, baseball, football,
futbol…) — consumed as `@mukco/ui-kit` (git dep).

**family-hub is its own thing.** Its System-7 design system is intentional;
it does not consume this kit, and kit changes should never be justified by
"family-hub could use this". Scope here = rails-vite-template descendants. Default palette = baseball's. See README.md for the component
inventory.

## Commands

```bash
npm run dev      # playground: every component with test data, offline
npm run check    # typecheck (src + demo + playground)
npm run build    # dist/ — CI commits this to main; never commit dist by hand
```

## Non-negotiables

- **Tokens only.** Components reference CSS custom properties from
  `src/ui.css` (`--surface`, `--brand`, `--stat-great`, …). Never write a hex,
  rgb(), or oklch() literal in a component. New visual concept → add a token,
  give it a default in ui.css, use it.
- **No I/O in components.** No fetch, no react-query, no router imports.
  Async edges are props (`onRun`, `fetcher`, `onSend`). The app owns its data.
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
```

Status colour is `--sev-ok/-warn/-error/-unknown`, never `--stat-*` — that ramp
is a percentile scale where elite is red, so it paints a healthy service in the
colour of a broken one.

Styling rule reminder: apps use their own layout classes (e.g. `.muted`,
`.panel`) plus kit classes (`ui-*`). The kit ships no bare-text utility classes.

## Versioning

Consumers pin `github:mukco/ui-kit#main` while the kit is young; tags exist
for pinning when stability matters. CI pushes a dist commit after every main
merge, so `#main` installs are always buildable.
