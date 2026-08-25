import type { ReactNode } from "react";
export interface MatchupSide {
    name: string;
    /** Logo image URL; falls back to initials when absent. */
    logoUrl?: string | null;
    score?: ReactNode;
}
interface Props {
    away: MatchupSide;
    home: MatchupSide;
    /** e.g. "Final", "7:05 PM", "Live" */
    status?: string;
    tone?: "live" | "final" | "upcoming";
    /** Sport- or app-specific line under the scoreboard (venue, week, pitchers). */
    detail?: ReactNode;
    onClick?: () => void;
    className?: string;
}
/** Two sides, a state chip, optional detail line. Games, series, trivia
    matchups — anything that is "these two, at it". */
export declare function MatchupCard({ away, home, status, tone, detail, onClick, className }: Props): import("react").JSX.Element;
export {};
