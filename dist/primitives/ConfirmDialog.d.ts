import { type ReactNode } from "react";
interface Props {
    open: boolean;
    /** What is about to happen, as a heading. "Reboot the gateway?" */
    title: string;
    /** The consequence, in a sentence. What a careful person would want to know
        before saying yes — how long it takes, what goes down, what cannot be
        undone. Omitting it makes this a speed bump rather than a decision. */
    children?: ReactNode;
    /** Names the action, never "OK". A button that says "Reboot" is one a reader
        can check against the heading; "OK" can only be checked against memory. */
    confirmLabel?: string;
    cancelLabel?: string;
    /** Paints the confirm button as destructive. */
    destructive?: boolean;
    /** Disables the confirm button and says so, for the in-flight moment. */
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    className?: string;
}
/**
 * Are you sure, for the things that cannot be taken back.
 *
 * The kit had no confirmation primitive at all, in an estate whose panel
 * reboots containers and runs SQL — so each consuming app either invented its
 * own or, more often, did the irreversible thing on a single click. That is
 * the divergence a shared kit exists to prevent, and it is the case where
 * divergence costs the most.
 *
 * Cancel is focused first, not confirm. Someone who opened this by accident
 * should be one Return away from nothing happening, and Escape does the same.
 * The dangerous button is never the default.
 */
export declare function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel, destructive, busy, onConfirm, onCancel, className, }: Props): import("react").JSX.Element | null;
export {};
