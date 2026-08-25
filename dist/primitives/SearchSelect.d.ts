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
    placeholder?: string;
    className?: string;
}
/**
 * Generic search-and-pick combobox: debounced async results in a dropdown,
 * selected value shown as a chip with a clear button. Bring your own search
 * endpoint; the kit owns none.
 */
export declare function SearchSelect<T>({ value, onChange, fetcher, getLabel, getHint, renderLeading, placeholder, className }: Props<T>): import("react").JSX.Element;
export {};
