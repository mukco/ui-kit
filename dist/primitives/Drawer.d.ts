import { type ReactNode } from "react";
interface Props {
    open: boolean;
    onClose: () => void;
    side?: "left" | "right";
    /** Accessible name for the panel. Required: a dialog with no name announces
        as "dialog" and nothing else, which says something opened but not what. */
    label: string;
    children: ReactNode;
}
/**
 * Off-canvas panel sliding over the page from either edge.
 *
 * It used to declare `role="dialog" aria-modal="true"` and implement none of
 * it: Tab walked out into the page behind, nothing took focus on open, closing
 * dropped focus on <body>, and the background kept scrolling. The ARIA told
 * assistive tech the rest of the page was inert while the browser disagreed.
 */
export declare function Drawer({ open, onClose, side, label, children }: Props): import("react").JSX.Element | null;
export {};
