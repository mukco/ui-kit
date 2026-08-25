interface Props {
    date: string;
    onChange: (isoDate: string) => void;
    /** Cap at today — for sources with no future data. */
    disableFuture?: boolean;
}
export declare function DateNav({ date, onChange, disableFuture }: Props): import("react").JSX.Element;
export {};
