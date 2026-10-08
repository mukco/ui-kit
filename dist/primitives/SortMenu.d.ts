export interface SortOption {
    id: string;
    label: string;
}
interface Props {
    options: SortOption[];
    active: string;
    onChange: (id: string) => void;
    /** The word before the choice: "Sort". */
    label?: string;
    className?: string;
}
/**
 * One key that says how a list is ordered and opens the choices — in place of
 * a row of chips per option. Football's waiver wire had nine sort chips
 * wrapping onto two lines under the position chips (2026-10-08); this is one
 * line, and the list it opens is the app's own, themed, not the phone's.
 *
 * The list is drawn into <body> at the key's position: inside the card it sat
 * under the rows below it, their headshots and crests showing through
 * (2026-10-08).
 */
export declare function SortMenu({ options, active, onChange, label, className }: Props): import("react").JSX.Element;
export {};
