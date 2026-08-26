import { type ReactNode } from "react";
interface Props<T> {
    value: T | null;
    onChange: (value: T | null) => void;
    /** Search function; the kit debounces and calls it from 2 characters on. */
    fetcher: (query: string) => Promise<T[]>;
    getLabel: (item: T) => string;
    /** Optional extra line under each result. */
    getHint?: (item: T) => ReactNode;
    /** Optional avatar/leading element per result. */
    renderLeading?: (item: T) => ReactNode;
    /**
     * Renders the whole option row, replacing label + hint.
     *
     * A label and one line of hint is right for picking a person and wrong for
     * picking a model, where the choice is made on several facts at once — what
     * it is, who makes it, what it costs in and what it costs out. Squeezing
     * that into one hint line produces the thing it replaced: a sentence you
     * have to read instead of a row you can scan.
     *
     * getLabel is still required and still used for the chip once something is
     * chosen, so a custom row cannot leave the selected state unnamed.
     */
    renderOption?: (item: T) => ReactNode;
    placeholder?: string;
    /**
     * How much has to be typed before the list appears. 2 by default, which is
     * right when the fetcher is a network search and wrong when it is a filter
     * over a list already in memory: there, requiring two characters means you
     * cannot see what the options *are* without guessing at one.
     *
     * Pass 0 for a browsable list — focusing the field then shows everything.
     */
    minChars?: number;
    className?: string;
}
/**
 * Generic search-and-pick combobox: debounced async results in a dropdown,
 * selected value shown as a chip with a clear button. Bring your own search
 * endpoint; the kit owns none.
 *
 * It was called a combobox and was not one. No role, no aria-expanded, no
 * arrow keys, no Escape, no Enter — and the options were buttons, so Tab
 * walked through every result one at a time. A screen reader user got a bare
 * text field that silently grew a list they were never told about; a keyboard
 * user got a list they could only leave by tabbing through all of it.
 *
 * The real pattern: the input keeps focus throughout and aria-activedescendant
 * points at the highlighted option. That is why the options are divs rather
 * than buttons — focus must never leave the input, or typing stops working
 * half way through choosing.
 */
export declare function SearchSelect<T>({ value, onChange, fetcher, getLabel, getHint, renderLeading, renderOption, placeholder, minChars, className }: Props<T>): import("react").JSX.Element;
export {};
