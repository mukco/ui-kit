import { type ComponentType, type ReactNode, type SVGProps } from "react";
/**
 * Phosphor draws icons the way Family Hub does: Pixelarticons, in the text
 * colour, never emoji or line icons. `pixel` draws the few the set lacks on
 * its grid; `Skin` swaps in a pixel icon under Phosphor and leaves light and
 * dark exactly as they were; `Glyph` does that for an app's own emoji marks.
 */
export type PixelIcon = ComponentType<SVGProps<SVGSVGElement>>;
export declare const pixel: (d: string) => PixelIcon;
/** Pixelarticons' star is an outline: right for "not watched", wrong for "watched". */
export declare const StarFilled: PixelIcon;
export declare const Bandage: PixelIcon;
/** The pixel icon under Phosphor; whatever was there before otherwise. */
export declare function Skin({ px, children }: {
    px: ReactNode;
    children: ReactNode;
}): import("react").JSX.Element;
/** Add an app's own marks (its ball, say) to the emoji Glyph knows. */
export declare function registerGlyphs(more: Record<string, PixelIcon>): void;
/** An app emoji: itself in light and dark, its pixel icon under Phosphor. */
export declare function Glyph({ e, className }: {
    e: string;
    className?: string;
}): import("react").JSX.Element;
