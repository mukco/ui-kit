type Row = unknown[];
export interface SandboxChartData {
    columns: string[];
    rows: Row[];
}
/** Auto-visualizing explorer for tabular query results: picks a shape from
    column types, then lets you switch types, axes, grouping and aggregation. */
export declare function SandboxChart({ columns, rows }: SandboxChartData): import("react").JSX.Element;
export {};
