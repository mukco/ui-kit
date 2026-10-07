import { type ReactNode } from "react";
/**
 * A game's plays, for every sport: one row per play — when, whose, what — with
 * the running score, a switch between the scoring plays and all of them, and
 * a tab per period. Replaces three hand-built feeds (Hoops' quarter tabs,
 * football's scoring plays and all-plays list, baseball's scoring plays and
 * all-plays list).
 *
 * The sport's detail goes in `head`: football's "TD +6 · Passing Touchdown",
 * baseball's batter, RBI and event. `text` is the play itself.
 *
 * Plays arrive in game order; the feed shows them newest first while the game
 * is live (`newestFirst`) so the latest play is at the top.
 */
export interface FeedPlay {
    id: string | number;
    /** The period it belongs to; matches a key in `periods`. */
    period: string | number;
    /** "2:59", "▲ 7". */
    when?: ReactNode;
    teamId?: string | number | null;
    teamName?: string | null;
    /** A line above the text: a scoring badge, the batter and the event. */
    head?: ReactNode;
    text: ReactNode;
    /** The score after the play. */
    score?: {
        away: number | string;
        home: number | string;
    } | null;
    scoring?: boolean;
    /** Small marks after the text — "TO", "PEN". */
    flags?: ReactNode;
}
export interface PlayFeedProps {
    plays: FeedPlay[];
    /** Tab per period, in order: [{ key: 1, label: "Q1" }, …]. A "Game" tab precedes them. */
    periods: Array<{
        key: string | number;
        label: string;
    }>;
    newestFirst?: boolean;
    /** Start on all plays rather than the scoring ones. */
    defaultAll?: boolean;
    className?: string;
}
export declare function PlayFeed({ plays, periods, newestFirst, defaultAll, className }: PlayFeedProps): import("react").JSX.Element | null;
/** A small mark for a play's head or flags: "TD +6", "2 RBI", "TO". */
export declare function PlayTag({ children, tone }: {
    children: ReactNode;
    tone?: "score" | "bad";
}): import("react").JSX.Element;
