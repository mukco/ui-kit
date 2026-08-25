interface Props {
    data?: Array<Record<string, unknown>> | null;
    valueKey?: string;
    color?: string;
    width?: number;
    height?: number;
}
/** Inline micro line chart — no axes, just the trend shape with gradient
    fill and a last-value dot that colors by direction. */
export declare function SparklineChart({ data, valueKey, color, width, height }: Props): import("react").JSX.Element | null;
export {};
