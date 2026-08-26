import type { ChartRow } from "./DynamicChart";
interface Props {
    data?: ChartRow[] | null;
    /** Row field to plot. Required: this chart has no business guessing which
        number a caller means, and the guess it used to make was a baseball one. */
    valueKey: string;
    /** What to call that number in the tooltip and axis. */
    valueLabel: string;
    /** When set, the current value renders inline next to this title in a header
        row instead of floating over the plot; the caller then skips its own title. */
    title?: string | null;
    color?: string;
    windowSize?: number;
    reference?: number | null;
    height?: number;
    formatValue?: (v: number) => string;
}
/**
 * Per-game dots with a rolling-average area line over them — the shape for
 * "how has this been trending lately?"
 */
export declare function RollingAverageChart({ data, valueKey, valueLabel, title, color, windowSize, reference, height, formatValue, }: Props): import("react").JSX.Element;
export {};
