import { cn } from "../cn"

interface Props {
  /** Bar width — a CSS length or percentage. Defaults to full width. */
  width?: string | number
  /** Bar height. Defaults to the text-line height the plain bar has always had. */
  height?: string | number
  /**
   * A circle rather than a bar, for an avatar or crest placeholder. `width`
   * and `height` both take `size`.
   */
  circle?: boolean
  size?: number
  /** Render N stacked bars — a paragraph or a list, without a map at the call site. */
  lines?: number
  className?: string
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
export function Skeleton({ width, height, circle = false, size = 32, lines, className }: Props) {
  if (lines && lines > 1) {
    return (
      <span className={cn("ui-skeleton-stack", className)} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className="ui-skeleton"
            // A ragged last line reads as text rather than as a block.
            style={{ width: i === lines - 1 ? "60%" : width ?? "100%", height }}
          />
        ))}
      </span>
    )
  }

  return (
    <span
      className={cn("ui-skeleton", circle && "ui-skeleton--circle", className)}
      style={circle ? { width: size, height: size } : { width, height }}
      aria-hidden="true"
    />
  )
}
