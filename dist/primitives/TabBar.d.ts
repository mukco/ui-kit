import { type ReactNode } from "react";
import type { PixelIcon } from "./Pixel";
/**
 * The phone tab bar for the Phosphor skin: the app's places along the foot of
 * the screen. Always rendered; ui-kit/phosphor.css shows it only under
 * Phosphor at phone width. The app owns routing: pass the current path and a
 * navigate.
 *
 * The tabs share the bar in equal slots with More last, so every app's bar is
 * spaced the same. The bar holds as many tabs as fit with their labels whole
 * at the current width and text size — the page you are on always among them —
 * and the rest head the More sheet. It re-fits when the bar's room or the
 * labels' size changes (window, web font, text size, skin) and on navigation.
 * Exactly one thing reads as active: the current tab, or More while its sheet
 * is open or when the current page lives under it.
 */
export interface TabBarTab {
    to: string;
    label: string;
    Icon: PixelIcon;
    /** Path prefixes that light this tab ("/" matches only the root). */
    match: string[];
}
/** A place the tabs do not hold, listed under More. */
export interface TabBarMoreItem {
    to: string;
    label: string;
    /** Heads a run of items: "News", "Definitions". */
    group?: string;
}
export interface TabBarProps {
    /** Every section, in order. Those that do not fit move to the top of More. */
    tabs: TabBarTab[];
    pathname: string;
    onNavigate: (to: string) => void;
    label?: string;
    /**
     * More's own content: the places only the nav bar's menu reaches (items) and
     * the session controls (footer). Under Phosphor the tab bar replaces that
     * menu on a phone. An item whose path is also a tab is dropped, since the
     * tab is in the bar or already at the top of the sheet.
     */
    more?: {
        items: TabBarMoreItem[];
        footer?: ReactNode;
    };
    /** Heads the tabs that did not fit, at the top of More (the same word in every app). */
    overflowHeading?: string;
}
export declare function TabBar({ tabs, pathname, onNavigate, label, more, overflowHeading }: TabBarProps): import("react").JSX.Element;
