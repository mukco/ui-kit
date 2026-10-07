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
export interface TabBarProps {
    tabs: TabBarTab[];
    pathname: string;
    onNavigate: (to: string) => void;
    label?: string;
}
export declare function TabBar({ tabs, pathname, onNavigate, label }: TabBarProps): import("react").JSX.Element;
