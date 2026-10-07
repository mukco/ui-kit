import { type ReactNode } from "react";
import type { PixelIcon } from "./Pixel";
/**
 * Family Hub's phone tab bar, for the Phosphor skin: the app's places along
 * the foot of the screen, five and a half to a row so the half says it
 * scrolls. Always rendered; ui-kit/phosphor.css shows it only under Phosphor
 * at phone width. The app owns routing: pass the current path and a navigate.
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
    tabs: TabBarTab[];
    pathname: string;
    onNavigate: (to: string) => void;
    label?: string;
    /**
     * A last tab, More, opening a sheet of the places the tabs leave out and
     * the session controls (footer). Under Phosphor the tab bar replaces the
     * nav bar's menu on a phone, so whatever only that menu reached goes here.
     */
    more?: {
        items: TabBarMoreItem[];
        footer?: ReactNode;
    };
}
export declare function TabBar({ tabs, pathname, onNavigate, label, more }: TabBarProps): import("react").JSX.Element;
