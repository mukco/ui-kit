import type { ReactNode } from "react";
interface Props {
    children: ReactNode;
    /** Right-aligned control — a toggle, a link, a small button. */
    action?: ReactNode;
    className?: string;
}
/** Small-caps label row for a sub-section inside a card, with an optional
    right-aligned control. Not PageHeader — this is for the divisions inside
    a card, not the page itself. */
export declare function SectionLabel({ children, action, className }: Props): import("react").JSX.Element;
export {};
