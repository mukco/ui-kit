import type { ReactNode } from "react";
import type { PlayerId } from "./config";
export interface LeaderRow {
    id?: PlayerId | null;
    name?: string | null;
    /** The small grey line under the name — a position, a team, a split. */
    meta?: ReactNode;
    /** The number the column ranks on. A node, so a row can show a progression. */
    value?: ReactNode;
    /** Name to resolve an absent id from; passed through to PlayerLink. */
    resolveName?: string | null;
}
export interface LeaderColumn {
    label: string;
    /** Sits before the label — an emoji or an Icon. */
    icon?: ReactNode;
    /** Colours the heading and every value in the column. */
    tone?: "hot" | "cold" | "neutral";
    rows: LeaderRow[];
    empty?: string;
}
/**
 * Two ranked columns of players — who is hot and who is not.
 *
 * Baseball's favourite-team panel, which is the reason this shape exists: three
 * players climbing on the left, three falling on the right, each a face, a name
 * and one number. Football had the same information — it computes a season
 * average, a last-three average and the delta between them for every player —
 * and rendered it as one undifferentiated list, so the panel that answers "who
 * should I be worried about" answered nothing at a glance.
 *
 * The kit owns the shape and the row; each app decides what its columns rank on
 * and what a value reads as, because "hot" is OPS over 14 days in one sport and
 * PPR per game over three weeks in the other.
 */
export declare function PlayerLeaders({ columns, className }: {
    columns: LeaderColumn[];
    className?: string;
}): import("react").JSX.Element;
