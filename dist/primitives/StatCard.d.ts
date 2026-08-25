import type { ReactNode } from "react";
export declare function PercentileBar({ percentile, className }: {
    percentile: number | null;
    className?: string;
}): import("react").JSX.Element | null;
export interface StatComparison {
    projectedLabel: string;
    status: string;
    /** Any CSS color; apps typically pass var(--ok) / var(--danger). */
    color: string;
}
export interface StatProgress {
    current: number;
    target: number;
    /** What the bar is pacing against. Omitted, only the fraction shows.
        This used to be the hardcoded string "Season pace", which is a baseball
        idea and was appearing in an infrastructure dashboard underneath
        "3.3 GB free of 7.8 GB". The kit's own rule says no sport names outside
        src/sports/, and this was the one that got through. */
    label?: string;
}
interface Props {
    label: string;
    value: ReactNode;
    subtitle?: string;
    percentile?: number | null;
    progress?: StatProgress;
    comparison?: StatComparison;
    /** Render the pill/bar in flat muted ink instead of the good/bad ramp — for
        descriptive stats that are not better-when-higher. */
    neutral?: boolean;
    /** Flip the ramp (lower percentile is better). */
    invert?: boolean;
    className?: string;
}
/**
 * A single stat value with optional percentile pill + bar, progress bar,
 * or projection comparison strip.
 */
export declare function StatCard({ label, value, subtitle, percentile, progress, comparison, neutral, invert, className }: Props): import("react").JSX.Element;
/** Compact horizontal stat display for tables/lists. */
export declare function InlineStatRow({ stats }: {
    stats: Array<{
        label: string;
        value: ReactNode;
    }>;
}): import("react").JSX.Element;
export {};
