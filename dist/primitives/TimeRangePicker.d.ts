export interface TimeRangeOption {
    id: string;
    label: string;
    /** How far back this reaches. The caller decides what to do with it. */
    hours: number;
}
export declare const DEFAULT_TIME_RANGES: TimeRangeOption[];
/**
 * One range, obeyed by every panel on the page.
 *
 * The spine of a monitoring screen: pick six hours here and the sparklines,
 * the charts and the counts all move together, so two panels are never quietly
 * describing two different afternoons. DateNav is the wrong shape for this —
 * it steps through days one at a time, which answers a different question.
 */
export declare function TimeRangePicker({ value, onChange, ranges, className, }: {
    value: string;
    onChange: (range: TimeRangeOption) => void;
    ranges?: TimeRangeOption[];
    className?: string;
}): import("react").JSX.Element;
