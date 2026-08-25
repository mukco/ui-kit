import "react-pivottable/pivottable.css";
interface Props {
    columns: string[];
    rows: unknown[][];
    /** Extra column names to treat as dimensions (drag targets, not sums). */
    dimensionColumns?: string[];
}
/** Drag-and-drop pivot over raw rows; the analysis step above a BasicTable.
    Dimensions vs metrics are auto-detected and extendable per app. */
export declare function SandboxPivot({ columns, rows, dimensionColumns }: Props): import("react").JSX.Element;
export {};
