import type { CSSProperties, ElementType, ReactNode } from "react"
import { cn } from "../cn"

/**
 * A rung of the kit's spacing scale — `--space-1` … `--space-6`, four-pixel
 * base. This is the type that does the work: a gap is a rung or it does not
 * compile, so there is no call site at which somebody can reach for 0.3rem
 * because it looked about right.
 */
export type Space = 1 | 2 | 3 | 4 | 5 | 6

/* The gap travels as a custom property rather than a modifier class per rung.
   A `.ui-gap-3` set would be a utility class, and a utility class is a door
   around the type above: the moment one exists in the stylesheet an app can
   write `className="ui-gap-3"` on anything and the scale stops being enforced
   anywhere. The property name is private to these three components. */
function gapStyle(gap: Space, style?: CSSProperties): CSSProperties {
  return { ...style, ["--ui-gap" as string]: `var(--space-${gap})` }
}

type Tag =
  | "div"
  | "span"
  | "section"
  | "ul"
  | "ol"
  | "li"
  | "nav"
  | "header"
  | "footer"
  | "form"
  | "fieldset"
  // A labelled form field is a two-item stack, and the thing that has to wrap
  // both is the label itself — otherwise clicking the caption stops focusing
  // the control.
  | "label"

interface StackProps {
  children: ReactNode
  /** Rung of the spacing scale between children. Default 4 (1rem). */
  gap?: Space
  /** Cross-axis. Default stretch — children fill the width. */
  align?: "start" | "center" | "end" | "stretch"
  /** A list of things is a `ul`, a form's fields are a `fieldset`. */
  as?: Tag
  className?: string
  style?: CSSProperties
}

/**
 * Things stacked down the page with one gap between them.
 *
 * Estate had written this eleven times — `.estate-home`, `.estate-faillist`,
 * `.ops-insights`, `.ops-field`, `.ops-token`, `.ops-consumer` and the rest —
 * each with its own gap, and the gaps were 1rem, 0.5rem, 0.3rem, 10px, 0.2rem
 * and `var(--space-2)`. Four of those are not on any scale. Nobody chose that;
 * it is what happens when the decision is taken again in each new rule, from
 * whatever looked right in the file that was open at the time.
 *
 * Measured down the overview the gaps ran 16, 12, 20, 8, 20, 8 — the most
 * tiring kind of layout to read, because the answer is nearly right everywhere
 * and exactly right nowhere.
 */
export function Stack({ children, gap = 4, align = "stretch", as, className, style }: StackProps) {
  const Tag = (as ?? "div") as ElementType
  return (
    <Tag
      className={cn("ui-stack", align !== "stretch" && `ui-stack--${align}`, className)}
      style={gapStyle(gap, style)}
    >
      {children}
    </Tag>
  )
}

interface ClusterProps {
  children: ReactNode
  /** Rung of the spacing scale between items. Default 2 (0.5rem). */
  gap?: Space
  /** Default center — a chip beside a heading sits on the heading's line. */
  align?: "start" | "center" | "end" | "baseline"
  justify?: "start" | "center" | "end" | "between"
  /**
   * Wraps by default, which is the whole point of the shape: this panel is
   * read on a phone, and a row of chips that cannot wrap is a row of chips
   * with some of them off the screen. Pass false only when the items must
   * stay on one line and you have handled the overflow yourself.
   */
  wrap?: boolean
  as?: Tag
  className?: string
  style?: CSSProperties
}

/**
 * A handful of things side by side that should stay side by side until they
 * run out of room: a title and its chips, a row of actions, a fact strip.
 *
 * `justify="between"` is the head-row case — a name on the left, whatever it
 * has earned on the right — which estate had spelled out separately as
 * `.ui-appcard-head`, `.ops-chart-head`, `.ops-overview-head`, `.estate-qrow`
 * and `.ops-consumer-head`. Baseball writes it 186 times as
 * `flex items-center justify-between`, which is the same row.
 */
export function Cluster({
  children,
  gap = 2,
  align = "center",
  justify = "start",
  wrap = true,
  as,
  className,
  style,
}: ClusterProps) {
  const Tag = (as ?? "div") as ElementType
  return (
    <Tag
      className={cn(
        "ui-cluster",
        align !== "center" && `ui-cluster--align-${align}`,
        justify !== "start" && `ui-cluster--justify-${justify}`,
        !wrap && "ui-cluster--nowrap",
        className,
      )}
      style={gapStyle(gap, style)}
    >
      {children}
    </Tag>
  )
}

interface PageProps {
  children: ReactNode
  /**
   * How wide the column is allowed to get. `narrow` (48rem) is reading width,
   * for a single column of prose or settings; `wide` (60rem) is the dashboard
   * default; `full` is for a screen that owns its own measure.
   */
  width?: "narrow" | "wide" | "full"
  /**
   * Rung of the spacing scale between the sections inside. Omit it and the
   * page is an ordinary block, which is what a screen whose children carry
   * their own margins wants — estate's section headings set their own rhythm
   * deliberately, and a gap on top of those margins would add to them rather
   * than replace them.
   */
  gap?: Space
  as?: Tag
  className?: string
  style?: CSSProperties
}

/**
 * The column a screen lives in: centred, capped, padded, and clear of the
 * phone's home indicator.
 *
 * That last part is why this is a component and not a note in a README. Every
 * app in the estate had written the measure and the padding by hand, and the
 * `env(safe-area-inset-bottom)` that keeps the last card above the gesture bar
 * was in some of them and not others — so the same layout lost its final row
 * on a phone depending on which screen you were on.
 */
export function Page({ children, width = "wide", gap, as, className, style }: PageProps) {
  const Tag = (as ?? "main") as ElementType
  return (
    <Tag
      className={cn("ui-page", `ui-page--${width}`, gap !== undefined && "ui-page--flow", className)}
      style={gap === undefined ? style : gapStyle(gap, style)}
    >
      {children}
    </Tag>
  )
}
