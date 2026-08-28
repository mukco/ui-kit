import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  children: ReactNode
  /** Right-aligned control — a toggle, a link, a small button. */
  action?: ReactNode
  className?: string
}

/** Small-caps label row for a sub-section inside a card, with an optional
    right-aligned control. Not PageHeader — this is for the divisions inside
    a card, not the page itself. */
export function SectionLabel({ children, action, className }: Props) {
  return (
    <div className={cn("ui-sectionlabel", className)}>
      <span className="ui-sectionlabel-text">{children}</span>
      {action}
    </div>
  )
}
