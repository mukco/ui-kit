/**
 * One scouting rating on the 20–80 scale — OOTP's bar: the rating filled in,
 * and the scouts' range for where he is headed as a lighter band beyond it.
 * "55 · 60–70" at the right says the same in numbers. A veteran's range
 * collapses onto his rating; a 20-year-old's is wide.
 *
 * Coloured by the scale's own bands (20–35 poor, 40–45 below, 50 average,
 * 55–60 above, 65–70 plus, 75–80 elite), so a page of them reads at a glance.
 */
export interface RatingBarProps {
    label: string;
    current: number;
    potentialLow?: number | null;
    potentialHigh?: number | null;
    className?: string;
}
export declare function ratingTier(v: number): "poor" | "below" | "average" | "above" | "plus" | "elite";
export declare function RatingBar({ label, current, potentialLow, potentialHigh, className }: RatingBarProps): import("react").JSX.Element;
