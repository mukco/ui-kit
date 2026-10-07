import type { ReactNode } from "react";
/**
 * A row of labelled numbers — the metric strip in a FantasyPlayerRow, and
 * anywhere a player's figures sit side by side. Football's MetricCells and
 * baseball's had the same anatomy; this is it once.
 *
 * The app builds the cells (its own metric definitions, colours and help
 * tooltips); the strip lays them out. With `fixed`, every cell has the same
 * width so a list of rows lines up column for column — a null value is still
 * a cell, showing "·", so the columns never shift.
 */
export interface MetricStripCell {
    key: string;
    value: ReactNode;
    label: ReactNode;
    /** The value's colour class (a heat tier, good/bad). */
    valueClassName?: string;
    /** After the label: a help tooltip. */
    help?: ReactNode;
    /** Under the label: a percentile bar, a sub-line. */
    extra?: ReactNode;
}
export interface MetricStripProps {
    cells: MetricStripCell[];
    /** Before the cells: a salary badge. */
    lead?: ReactNode;
    compact?: boolean;
    /** Equal fixed widths, so rows align down a list. */
    fixed?: boolean;
    /** After the cells. */
    trailing?: ReactNode;
    className?: string;
}
export declare function MetricStrip({ cells, lead, compact, fixed, trailing, className }: MetricStripProps): import("react").JSX.Element;
