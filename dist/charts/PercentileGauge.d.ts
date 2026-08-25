export interface GaugeStat {
    label: string;
    value: React.ReactNode;
    percentile: number | null | undefined;
    category?: string;
    /** Descriptive stat: flat muted bar, no good/bad implication. */
    neutral?: boolean;
}
/** Percentile sliders: label · value · a track banded poor→elite with the
    percentile riding the bar as a bubble. Grouped by category, sorted
    best→worst within each group. */
export declare function PercentileGauge({ stats, className }: {
    stats?: GaugeStat[];
    className?: string;
}): import("react").JSX.Element | null;
