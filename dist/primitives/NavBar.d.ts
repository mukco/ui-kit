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
    /**
     * Where the brand goes when pressed. Supply one — a logo that does nothing
     * is a broken affordance: it looks like the way home, every other site has
     * trained people that it is, and pressing it doing nothing reads as the app
     * being stuck rather than as the logo being decorative.
     */
    onBrandClick?: () => void;
    brandHref?: string;
    items: NavItem[];
    /** Right-aligned cluster: search, icons, avatar. */
    right?: ReactNode;
    /**
     * The bottom of the mobile drawer, below a divider: sign-out, a theme
     * control, a link to settings — the things that are about the session
     * rather than about where you are in the app.
     *
     * They belong here rather than in the top bar. A phone's bar has room for a
     * hamburger, a brand and two icons, and every session control added to it
     * takes width from the app's own name. The drawer is already open when
     * somebody is looking for "sign out", and it has room to group them.
     */
    drawerFooter?: ReactNode;
    className?: string;
}
/**
 * Top navigation: plain links and click-open dropdowns on desktop; a
 * hamburger that slides a drawer in from the left on phones (under 640px,
 * CSS-driven). The app supplies hrefs/onClicks — routing stays app-side.
 */
export declare function NavBar({ brand, onBrandClick, brandHref, items, right, drawerFooter, className }: Props): import("react").JSX.Element;
export {};
