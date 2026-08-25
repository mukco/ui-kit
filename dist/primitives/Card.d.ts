import type { ReactNode } from "react";
interface Props {
    children: ReactNode;
    className?: string;
    /** Render as a section with a title bar. */
    title?: ReactNode;
}
/** The kit's basic surface: bordered, rounded, subtly elevated. */
export declare function Card({ children, className, title }: Props): import("react").JSX.Element;
export {};
