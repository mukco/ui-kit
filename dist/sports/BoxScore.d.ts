import { type ReactNode } from "react";
/**
 * A game's box score, for every sport: a tab per team, then that team's
 * sections — basketball's one table of starters and bench, football's
 * passing / rushing / receiving…, baseball's batters and pitchers. Each
 * section is a table: the player column stays put while the numbers scroll
 * sideways on a phone, and a section may end in the team's totals.
 *
 * Cells are whatever the sport hands in, keyed by column; a missing key is an
 * empty cell. The player cell is the app's own link (PlayerLink, a hover
 * card), and `note` sits beside it — a position, a role, a ★.
 */
export interface BoxColumn {
    key: string;
    label: ReactNode;
    /** The column the eye goes to first (PTS, H): bold. */
    strong?: boolean;
    /** Secondary (shooting splits, MIN): muted. */
    muted?: boolean;
}
export interface BoxRow {
    id: string | number;
    player: ReactNode;
    note?: ReactNode;
    cells: Record<string, ReactNode>;
    /** Greyed — did not play, scratched. */
    dim?: boolean;
}
export interface BoxSection {
    /** Heads the player column: "Passing", "Batters". */
    title: string;
    columns: BoxColumn[];
    /** Rows under the title; or several labelled groups sharing the columns
        (basketball's Starters and Bench), each with its own header row. */
    rows?: BoxRow[];
    groups?: Array<{
        label: string;
        rows: BoxRow[];
    }>;
    totals?: Record<string, ReactNode>;
}
export interface BoxTeam {
    key: string;
    /** The tab: "BKN". */
    label: string;
    sections: BoxSection[];
    /** Under the tables — who did not play. */
    footnote?: ReactNode;
}
export interface BoxScoreProps {
    teams: BoxTeam[];
    /** Which team's tab opens first; the first team otherwise. */
    initial?: string;
    className?: string;
}
export declare function BoxScore({ teams, initial, className }: BoxScoreProps): import("react").JSX.Element | null;
