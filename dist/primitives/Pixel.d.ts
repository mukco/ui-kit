import { type ComponentType, type JSX, type ReactNode, type SVGProps } from "react";
/**
 * Phosphor draws icons the way Family Hub does: Pixelarticons, in the text
 * colour, never emoji or line icons. `pixel` draws the few the set lacks on
 * its grid; `Skin` swaps in a pixel icon under Phosphor and leaves light and
 * dark exactly as they were; `Glyph` does that for an app's own emoji marks.
 */
export type PixelIcon = ComponentType<SVGProps<SVGSVGElement>>;
/**
 * One icon from a path on Pixelarticons' 24×24 grid, in the text colour.
 * Decorative by default (`aria-hidden`), unless it is given a name
 * (`aria-label` / `aria-labelledby`): a labelled icon is the thing a screen
 * reader should hear, as Family Hub's "Liked" heart is. Typed as Pixelarticons'
 * own components are, so the two mix in one list.
 */
export declare const pixel: (d: string) => (props: SVGProps<SVGSVGElement>) => JSX.Element;
/** Pixelarticons' star is an outline: right for "not watched", wrong for "watched". */
export declare const StarFilled: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Bandage: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Remote: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Pot: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const SkipNext: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const SkipPrevious: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Sunrise: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const PlantSprout: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const PlantSapling: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const PlantTree: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const PlantFlower: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Takeout: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Pan: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const PlayingCard: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const HeartFilled: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const TurnBack: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const TurnAhead: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const CheckBold: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const CheckDoubleBold: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const LinkBroken: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const Comic: (props: SVGProps<SVGSVGElement>) => JSX.Element;
export declare const StarFilledPointed: (props: SVGProps<SVGSVGElement>) => JSX.Element;
/**
 * For an app whose icons are pixel icons in every look (Family Hub, whose
 * rule is "pixel icons, never emoji or line icons"): Skin and Glyph then pick
 * the pixel one whatever the skin theme. Call once at boot. Off by default:
 * the template apps keep their line icons and emoji outside Phosphor.
 */
export declare function configurePixel({ everywhere }: {
    everywhere: boolean;
}): void;
/** The pixel icon under Phosphor (or everywhere, see configurePixel); whatever was there before otherwise. */
export declare function Skin({ px, children }: {
    px: ReactNode;
    children: ReactNode;
}): JSX.Element;
/** Add an app's own marks (its ball, say) to the emoji Glyph knows. */
export declare function registerGlyphs(more: Record<string, PixelIcon>): void;
/** An app emoji: itself in light and dark, its pixel icon under Phosphor (or everywhere, see configurePixel). */
export declare function Glyph({ e, className }: {
    e: string;
    className?: string;
}): JSX.Element;
