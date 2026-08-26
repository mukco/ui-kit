import { type ReactNode } from "react";
/** Accessible on/off switch. */
export declare function Toggle({ checked, onChange, label, disabled }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label?: string;
    disabled?: boolean;
}): import("react").JSX.Element;
/** One settings line: what it is, what it does, the control. */
export declare function SettingRow({ label, hint, children }: {
    label: ReactNode;
    hint?: ReactNode;
    children: ReactNode;
}): import("react").JSX.Element;
interface FieldProps {
    value: string;
    onChange: (v: string) => void;
    options?: Array<{
        value: string;
        label: string;
    }>;
    placeholder?: string;
    type?: string;
    /**
     * What is wrong with the current value, in words the person can act on.
     *
     * The kit had no way to say this at all, so every app either invented its
     * own or — far more often — showed nothing and let the submit fail. When set,
     * the field is marked invalid, described by the message, and the message is
     * announced: colour alone would leave the whole thing invisible to anybody
     * not looking straight at it.
     *
     * Say what to do, not that something is wrong. "Use a number of minutes"
     * beats "Invalid input".
     */
    error?: string;
    /** Ties the field to its own error text. Supply one when two fields with the
        same label can appear on a page. */
    id?: string;
}
export declare function TextField({ value, onChange, placeholder, type, error, id }: FieldProps): import("react").JSX.Element;
export declare function SelectField({ value, onChange, options, error, id }: FieldProps): import("react").JSX.Element;
export type ChipTone = "ok" | "stale" | "muted" | "danger";
/** Small status badge: Live, Stale, Cached… */
export declare function Chip({ tone, children, onClick, title, }: {
    tone?: ChipTone;
    children: ReactNode;
    /** Makes the chip a door. A named thing that can be opened should be
        openable — the alternative keeps coming out as a comma-separated list of
        places to go with no way to reach any of them. */
    onClick?: () => void;
    title?: string;
}): import("react").JSX.Element;
export {};
