import type { ReactNode } from "react";
export interface MatchupSide {
    name: string;
    /** Logo image URL; falls back to initials when absent or on error. */
    logoUrl?: string | null;
    score?: ReactNode;
    /** e.g. "63-71". Rendered under the name. */
    record?: ReactNode;
}
interface Props {
    away: MatchupSide;
    home: MatchupSide;
    /** The state chip's content — "Final", "7:05 PM", "Top 4". */
    status?: ReactNode;
    tone?: "live" | "final" | "upcoming";
    /** Extra chips beside the status — a watch link, a broadcast badge. */
    badges?: ReactNode;
    /** Right of the header: venue, week, round. */
    meta?: ReactNode;
    /** Background photograph. A scrim goes over it so the card stays legible. */
    art?: string | null;
    /**
     * Replaces the score cluster between the two sides. Use it when a game has
     * no score to show — "vs" before first pitch — or when the sport wants its
     * own arrangement of one.
     */
    middle?: ReactNode;
    /** The sport's own footer: probable pitchers, spread, possession. */
    foot?: ReactNode;
    /** Simple one-line alternative to `foot`. */
    detail?: ReactNode;
    /** Draws the selected/favourite outline. */
    highlighted?: boolean;
    onClick?: () => void;
    className?: string;
}
/**
 * Two sides, a state chip, an optional photograph behind it, and a slot for
 * whatever the sport puts at the bottom.
 *
 * This is the shell only. What goes in `foot` is the app's business —
 * baseball's probable pitchers and lineup toggle, football's spread and
 * possession — but the proportions, the type scale and the way a matchup is
 * laid out live here, so the two cannot drift apart. Two apps hand-rolling
 * this and copying each other's measurements is exactly what it replaces.
 */
export declare function MatchupCard({ away, home, status, tone, badges, meta, art, middle, foot, detail, highlighted, onClick, className, }: Props): import("react").JSX.Element;
export {};
