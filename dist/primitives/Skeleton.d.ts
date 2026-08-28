interface Props {
    /** Bar width — a CSS length or percentage. Defaults to full width. */
    width?: string | number;
    /** Bar height. Defaults to the text-line height the plain bar has always had. */
    height?: string | number;
    /**
     * A circle rather than a bar, for an avatar or crest placeholder. `width`
     * and `height` both take `size`.
     */
    circle?: boolean;
    size?: number;
    /** Render N stacked bars — a paragraph or a list, without a map at the call site. */
    lines?: number;
    className?: string;
}
/**
 * The shimmer placeholder that holds a thing's space while it loads.
 *
 * The kit had the `.ui-skeleton` class but no component, so both apps hand-rolled
 * the markup around it — and neither could make a round one for an avatar, which
 * is why loading rows jittered as images resolved: a bar where a circle was
 * about to be. `circle` and `lines` are the two shapes they kept rebuilding.
 *
 * A skeleton is not a spinner. Use it where the layout is already known and you
 * are waiting to fill it in; use Loading where you have nothing to hold.
 */
export declare function Skeleton({ width, height, circle, size, lines, className }: Props): import("react").JSX.Element;
export {};
