import { useState, type ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  title: ReactNode
  /** Always-visible summary line under the title. */
  subtitle?: ReactNode
  open?: boolean
  onToggle?: (open: boolean) => void
  children: ReactNode
  className?: string
}

/** Card whose body folds away behind a header row — the expandable cards
    used across player and team pages. Controlled or self-contained. */
export function ExpandableCard({ title, subtitle, open, onToggle, children, className }: Props) {
  const [innerOpen, setInnerOpen] = useState(false)
  const isOpen = open ?? innerOpen

  function toggle() {
    onToggle?.(!isOpen)
    if (open == null) setInnerOpen((v) => !v)
  }

  return (
    <div className={cn("ui-card ui-expandable", className)}>
      <button type="button" className="ui-expandable-head" onClick={toggle} aria-expanded={isOpen}>
        <span className="ui-expandable-titles">
          <span className="ui-expandable-title">{title}</span>
          {subtitle && <span className="ui-expandable-sub">{subtitle}</span>}
        </span>
        <span className={cn("ui-expandable-chevron", isOpen && "ui-expandable-chevron--open")} aria-hidden="true">
          ▾
        </span>
      </button>
      {isOpen && <div className="ui-expandable-body">{children}</div>}
    </div>
  )
}
