export type ChartType = "bar" | "horizontal_bar" | "line" | "scatter";
export type ChartRow = Record<string, unknown>;
export declare function chartPalette(i: number): string;
interface Props {
    type: ChartType;
    title?: string;
    data?: ChartRow[] | null;
    xKey?: string;
    yKey?: string;
    color?: string;
    height?: number;
}
/**
 * The one chart for AI-shaped data: pass rows + which keys to plot and pick a
 * shape. Renders an empty state on no data and offers PNG/CSV export.
 */
export declare function DynamicChart({ type, title, data, xKey, yKey, color, height }: Props): import("react").JSX.Element | null;
export {};
