import type { ReactNode } from "react";
export interface MetricCellDef {
    key: string;
    label: string;
    help?: string;
    value: string | null;
    colorClass?: string;
    sub?: string | null;
    pctile?: number | null;
}
export interface MetricOpts {
    dense?: boolean;
    ptsExact?: boolean;
    ptsLabel?: string | null;
    parLabel?: string | null;
}
export declare function PercentileBarSmall({ pct }: {
    pct?: number | null;
}): import("react").JSX.Element | null;
/**
 * Shared metric-cells strip: value over label, columns separated by vertical rules.
 * Used by both baseball (pts/pPD+/surplus/PAR/market) and football (points/PAR/WOPR/EPA).
 * Fixed-width `align` mode keeps every requested key even when null (muted middot) so columns land at same x.
 * Salary badge (when `salary` present) sits in the middle as a visual divider, like baseball's bb-mc-sal.
 */
export declare function MetricCells({ metrics, keys, defs, dense, compact, align, showBars, showHelp, hideSalary, trailing, }: {
    metrics: Record<string, any>;
    keys: string[];
    defs: Record<string, (m: Record<string, any>, o: MetricOpts) => MetricCellDef>;
    dense?: boolean;
    compact?: boolean;
    align?: boolean;
    showBars?: boolean;
    showHelp?: boolean;
    hideSalary?: boolean;
    trailing?: ReactNode;
}): import("react").JSX.Element;
