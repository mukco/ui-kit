import type { SVGProps } from "react";
/**
 * The line icons the estate's apps already use, in one place.
 *
 * Extracted from baseball's Navbar, which had them inline as raw <svg> in the
 * markup — so every other app either copied the paths or reached for an emoji,
 * and the estate panel ended up with a full-colour 🔔 and a full-colour ⚙
 * sitting beside monochrome glyphs.
 *
 * Lucide geometry: 24x24 box, no fill, stroke on currentColor at 2, round caps
 * and joins. currentColor is the whole point — an icon inherits the colour of
 * the control it sits in, so it follows the theme without anybody wiring it up.
 */
type IconProps = SVGProps<SVGSVGElement> & {
    size?: number;
};
export declare const IconSun: (p: IconProps) => import("react").JSX.Element;
export declare const IconMoon: (p: IconProps) => import("react").JSX.Element;
export declare const IconSignOut: (p: IconProps) => import("react").JSX.Element;
export declare const IconSettings: (p: IconProps) => import("react").JSX.Element;
export declare const IconSearch: (p: IconProps) => import("react").JSX.Element;
export declare const IconRefresh: (p: IconProps) => import("react").JSX.Element;
export declare const IconClose: (p: IconProps) => import("react").JSX.Element;
export declare const IconBell: (p: IconProps) => import("react").JSX.Element;
export {};
