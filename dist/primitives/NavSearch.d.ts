import { type KeyboardEvent } from "react";
interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Announced to assistive tech, since a search field in a nav bar rarely has
        a visible label. */
    label?: string;
    /** Shown while results are being fetched. */
    busy?: boolean;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    /**
     * Binds ⌘K / Ctrl-K to focus this field, and shows the hint. Off by default:
     * two fields on one page both claiming the shortcut is worse than neither
     * having it.
     */
    shortcut?: boolean;
    className?: string;
}
/**
 * The search field in a nav bar — baseball's, extracted.
 *
 * The icon lives *inside* the field rather than beside it. That is the whole
 * difference between "a text input, and separately a magnifier" and "a search
 * box": the affordance is the box, and a glyph parked next to it reads as
 * another button in the row of buttons.
 *
 * The ⌘K hint is a `kbd`, hidden on narrow screens where there is no keyboard
 * to press it with and no room to say so.
 */
export declare function NavSearch({ value, onChange, placeholder, label, busy, onKeyDown, shortcut, className, }: Props): import("react").JSX.Element;
export {};
