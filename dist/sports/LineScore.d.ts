import type { ReactNode } from "react";
/**
 * A game's score by period, for every sport: the periods carry their own
 * labels, so nine innings, four quarters and overtime all fit one table, and
 * whatever comes after the periods (T, or R / H / E) is a list of totals.
 * Replaces the three hand-built line scores the apps had.
 *
 *   <LineScore away={…} home={…}
 *     periods={[{ label: "1", away: 0, home: 2 }, …]}           // baseball
 *     totals={[{ label: "R", away: 3, home: 4, strong: true }, { label: "H", … }, { label: "E", … }]}
 *     minPeriods={9} highlightScoring />
 *
 *   <LineScore … periods={quarters}   // Q1…Q4, OT
 *     totals={[{ label: "T", away: 24, home: 27, strong: true }]} dimLoser />
 */
export interface LineScorePeriod {
    label: ReactNode;
    away?: number | string | null;
    home?: number | string | null;
    /** The period being played now (live games). */
    current?: boolean;
}
export interface LineScoreSide {
    teamId?: string | number | null;
    /** Short name in the row: "BKN", "PIT". */
    name: string;
}
export interface LineScoreTotal {
    label: string;
    away: ReactNode;
    home: ReactNode;
    /** The score itself (T, R): set in bold. */
    strong?: boolean;
}
export interface LineScoreProps {
    away: LineScoreSide;
    home: LineScoreSide;
    periods: LineScorePeriod[];
    totals: LineScoreTotal[];
    /** Pad to at least this many period columns; unplayed ones show "·". */
    minPeriods?: number;
    /** Embolden a period in which a side scored (baseball's runs). */
    highlightScoring?: boolean;
    /** Mute the losing side's strong totals. */
    dimLoser?: boolean;
    /** Smaller, for sitting inside a game's header. */
    compact?: boolean;
    /** Crests beside the names (needs teamId and configureSports' logoUrl). */
    logos?: boolean;
    className?: string;
}
export declare function LineScore({ away, home, periods, totals, minPeriods, highlightScoring, dimLoser, compact, logos, className }: LineScoreProps): import("react").JSX.Element;
