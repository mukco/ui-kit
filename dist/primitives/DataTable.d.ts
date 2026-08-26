import { type ReactNode } from "react";
export interface TableColumn<T> {
    key: string;
    label: string;
    /** Format the raw value for display. */
    fmt?: (value: unknown) => ReactNode;
    align?: "left" | "right";
    /** Column participates in the heat ramp; flip for lower-is-better stats. */
    lowIsBetter?: boolean;
    /** Escape hatch: fully custom cell content (identity links, badges…). */
    render?: (row: T) => ReactNode;
}
interface Props<T extends Record<string, unknown>> {
    data: T[] | null;
    columns: TableColumn<T>[];
    /** Stable row identity; defaults to array index. */
    rowKey?: (row: T, index: number) => string;
    /** When provided, rows become click-to-expand with this detail line. */
    renderExpanded?: (row: T) => ReactNode;
    empty?: ReactNode;
    /** When set, the table renders a failure instead of an empty state. `data`
        being null means "nothing yet"; this means "the attempt failed", and the
        two were previously indistinguishable to the reader. */
    error?: ReactNode;
    /** Offered alongside `error`. */
    onRetry?: () => void;
    className?: string;
}
/** Value pill colored against its column distribution. */
export declare function HeatPill({ children, color }: {
    children: ReactNode;
    color?: string | null;
}): import("react").JSX.Element;
/**
 * Column-driven sortable table with distribution heat pills and optional
 * click-to-expand rows. Sorting lives inside the component. Wide tables
 * scroll horizontally on phones.
 */
export declare function DataTable<T extends Record<string, unknown>>({ data, columns, rowKey, renderExpanded, empty, error, onRetry, className, }: Props<T>): import("react").JSX.Element;
export {};
