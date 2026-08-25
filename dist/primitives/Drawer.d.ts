import { type ReactNode } from "react";
interface Props {
    open: boolean;
    onClose: () => void;
    side?: "left" | "right";
    /** Accessible label for the panel. */
    label?: string;
    children: ReactNode;
}
/** Off-canvas panel sliding over the page from either edge, with overlay. */
export declare function Drawer({ open, onClose, side, label, children }: Props): import("react").JSX.Element | null;
export {};
