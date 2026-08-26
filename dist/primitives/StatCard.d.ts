import type { Severity } from "./Status";
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
/**
 * Compact horizontal stat display for tables and lists.
 *
 * `tone` exists because a row of counts is usually one interesting number and
 * several zeroes — "Workers 8 · Ready 0 · Running 0 · Failed 3" — and rendering
 * all four identically means the panel reporting three dead jobs looks like the
 * panel reporting none. The caller decides which number is news; nothing here
 * guesses, because "high is bad" is true of failures and false of workers.
 */
export declare function InlineStatRow({ stats, }: {
    stats: Array<{
        label: string;
        value: ReactNode;
        tone?: Severity;
    }>;
}): import("react").JSX.Element;
export {};
