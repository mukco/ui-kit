import type { ReactNode } from "react";
interface Props {
    children: ReactNode;
    className?: string;
    /** Render as a section with a title bar. */
    title?: ReactNode;
    /** A line under the title — context, not a second heading. */
    subtitle?: ReactNode;
    /** Rendered next to the title — a stat-help tooltip, typically. */
    help?: ReactNode;
    /** Right-aligned control(s) in the title row — a toggle, a button, a link. */
    actions?: ReactNode;
}
/** The kit's basic surface: bordered, rounded, subtly elevated. */
export declare function Card({ children, className, title, subtitle, help, actions }: Props): import("react").JSX.Element;
export {};
