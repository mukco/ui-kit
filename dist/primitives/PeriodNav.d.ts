interface Period {
    id: string;
    label: string;
}
interface Props {
    periods: Period[];
    /** The id of the period shown. */
    value: string;
    onChange: (id: string) => void;
    /** The period "now" lives in; when another is shown, a button goes back to it. */
    current?: string;
    /** The back-to-now button's word: "This week". */
    currentLabel?: string;
    /** What a period is called, for the arrows' labels: "week". */
    noun?: string;
}
/**
 * DateNav for a schedule that steps by something other than a day — a
 * league's weeks, a tournament's rounds. ‹ prev · label (a picker over it) · next ›,
 * drawn with DateNav's own classes so the two read as one control.
 *
 * The picker is an invisible <select> laid over the label: unlike a date
 * input, a select opens on a click to itself, so it takes the tap directly.
 */
export declare function PeriodNav({ periods, value, onChange, current, currentLabel, noun }: Props): import("react").JSX.Element;
export {};
