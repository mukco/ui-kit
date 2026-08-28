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
    /**
     * Render the title row as a full-bleed bar: tinted, with a rule under it,
     * meeting the card's edges. For a panel whose header labels a list rather
     * than introducing prose.
     *
     * Baseball had ten of these under ten page-specific names
     * (.bb-stand-head, .bb-bx-titlebar, .bb-st-divhead, ...) before this
     * existed, all the same handful of declarations.
     *
     * `"subtle"` is the quieter tint — a toolbar rather than a section heading.
     */
    headBar?: boolean | "subtle";
}
/** The kit's basic surface: bordered, rounded, subtly elevated. */
export declare function Card({ children, className, title, subtitle, help, actions, headBar }: Props): import("react").JSX.Element;
export {};
