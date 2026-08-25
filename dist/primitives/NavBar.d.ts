import { type ReactNode } from "react";
export interface NavChild {
    label: string;
    href?: string;
    onClick?: () => void;
}
export interface NavItem {
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    /** When present the item renders as a dropdown of these entries. */
    children?: NavChild[];
}
interface Props {
    brand?: ReactNode;
    items: NavItem[];
    /** Right-aligned cluster: search, icons, avatar. */
    right?: ReactNode;
    className?: string;
}
/**
 * Top navigation: plain links and click-open dropdowns on desktop; a
 * hamburger that slides a drawer in from the left on phones (under 640px,
 * CSS-driven). The app supplies hrefs/onClicks — routing stays app-side.
 */
export declare function NavBar({ brand, items, right, className }: Props): import("react").JSX.Element;
export {};
