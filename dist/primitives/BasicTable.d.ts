interface Props {
    /** Column names, shown as sortable headers. */
    columns: string[];
    /** Rows as arrays aligned with columns; cells may be primitives or null. */
    rows: unknown[][];
    /** Footer of per-column averages / min–max ranges / non-null counts. */
    showSummary?: boolean;
    /** Max body height before scrolling (px). */
    maxHeight?: number;
    /** Render a cell specially (identity links etc.); falls back to default formatting. */
    renderCell?: (value: unknown, col: string, rowIndex: number) => React.ReactNode;
    className?: string;
}
/** The basic data grid: plain columns+rows, sortable headers, sticky head,
    optional stats footer. The simpler sibling of DataTable — no heat pills,
    no object rows; exactly what raw query results want. */
export declare function BasicTable({ columns, rows, showSummary, maxHeight, renderCell, className }: Props): import("react").JSX.Element;
export {};
