import type { ReactNode } from "react";
interface Props {
    icon?: ReactNode;
    children: ReactNode;
    /**
     * Tight variant for a container that cannot give up 2.5rem — a fixed-height
     * popover, a table cell, an inline row. Without it an app with nowhere to put
     * the full block hand-rolls a small one instead, which is exactly how these
     * states diverged between apps.
     */
    compact?: boolean;
    className?: string;
}
/** A friendly nothing-here block. */
export declare function EmptyState({ icon, children, compact, className }: Props): import("react").JSX.Element;
export {};
