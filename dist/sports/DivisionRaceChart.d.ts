/**
 * A division's win-percentage race over a season, as a line chart, plus a
 * legend of current standing.
 *
 * Ported from baseball's — the one app whose version worked. Football's own
 * copy rendered blank: it wrapped the chart in an extra `flex: 1` div inside
 * `Panel`'s `.ui-panel-scroll`, which is a flex *item* of `.ui-panel`, not a
 * flex *container* itself — so the inner div's `flex: 1 1 0%` had no flex
 * parent to size against and collapsed to 0 height. This component owns no
 * wrapper of its own beyond that one `flex: 1; min-height: 0` div, and is
 * meant to sit as a *direct* child of `Panel` with `scroll={false}` — same
 * shape baseball always used, just via the shared component instead of a
 * hand-rolled `ui-card ui-panel` div.
 */
export interface RaceTeam {
    teamId: number;
    teamAbbr?: string;
    /** Hex team color. Brightened for legibility — see brightenForDark below. */
    color?: string;
    /** One point per completed game. `date` is a label, not necessarily a
        parseable date — football's is `"W4"` (a week number), baseball's is an
        ISO date string. Pass `formatLabel` to control how it renders. */
    series: Array<{
        date: string;
        winPct: number;
    }>;
}
export declare function DivisionRaceChart({ divisionRace, favTeamId, 
/** Y-axis bounds. Baseball's teams cluster near .500 over a long season, so
    [0.3, 0.7] reads better zoomed in; a shorter season (or a blowout
    division) wants the full [0, 1] so a leader or a winless team is not
    pinned to the axis edge. */
domain, 
/** How a series point's `date` renders on the x-axis and in the tooltip.
    Identity by default — pass a formatter for a parseable date string
    (e.g. `(d) => format(parseISO(d), 'M/d')`). */
formatLabel, }: {
    divisionRace?: RaceTeam[];
    favTeamId: number;
    domain?: [number, number];
    formatLabel?: (date: string) => string;
}): import("react").JSX.Element;
