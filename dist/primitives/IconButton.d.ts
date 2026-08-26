import type { ButtonHTMLAttributes, ReactNode } from "react";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Required. An icon-only control with no name is unusable by anyone who
        cannot see the icon, and unhoverable by anyone who can but does not
        recognise it. */
    label: string;
    children: ReactNode;
}
/**
 * A square, bordered icon button — baseball's nav control, extracted.
 *
 * Every app was rolling its own: estate had a bare glyph for search, a
 * borderless bell and a bordered text button for sign-out, all in one row.
 * This is the one shape, so a cluster of them reads as a cluster.
 *
 * `label` becomes both aria-label and title, because an icon button needs to
 * announce itself and to answer a hover.
 */
export declare function IconButton({ label, children, className, ...rest }: Props): import("react").JSX.Element;
export {};
