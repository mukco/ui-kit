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
}

/** The kit's basic surface: bordered, rounded, subtly elevated. */
export function Card({ children, className, title, subtitle, help, actions }: Props) {
  return (
    <section className={cn("ui-card", className)}>
      {(title || actions) && (
        <div className="ui-card-head">
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
