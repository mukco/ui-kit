import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  children: ReactNode
  className?: string
  /** Render as a section with a title bar. */
  title?: ReactNode
  /** A line under the title — context, not a second heading. */
  subtitle?: ReactNode
  /** Rendered next to the title — a stat-help tooltip, typically. */
  help?: ReactNode
  /** Right-aligned control(s) in the title row — a toggle, a button, a link. */
  actions?: ReactNode
  /**
   * Render the title row as a full-bleed bar: tinted, with a rule under it,
   * meeting the card's edges. For a panel whose header labels a list rather
   * than introducing prose.
   *
   * Baseball had ten of these under ten page-specific names
   * (.bb-stand-head, .bb-bx-titlebar, .bb-st-divhead, ...) before this
   * existed, all the same handful of declarations.
   */
  headBar?: boolean
}

/** The kit's basic surface: bordered, rounded, subtly elevated. */
export function Card({ children, className, title, subtitle, help, actions, headBar }: Props) {
  return (
    <section className={cn("ui-card", headBar && "ui-card--barred", className)}>
      {(title || actions) && (
        <div className={cn("ui-card-head", headBar && "ui-card-head--bar")}>
          <div className="ui-card-head-text">
            {title && (
              <h3 className="ui-card-title">
                {title}
                {help}
              </h3>
            )}
            {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ui-card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
