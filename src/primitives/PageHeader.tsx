import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  /** Right-aligned action buttons. */
  actions?: ReactNode
  onBack?: () => void
  className?: string
}

/** A screen's header line: optional back arrow, title, subtitle, actions. */
export function PageHeader({ title, subtitle, actions, onBack, className }: Props) {
  return (
    <header className={cn("ui-pagehead", className)}>
      {onBack && (
        <button type="button" className="ui-pagehead-back" aria-label="Back" onClick={onBack}>
          ←
        </button>
      )}
      <div className="ui-pagehead-titles">
        <h1 className="ui-pagehead-title">{title}</h1>
        {subtitle && <p className="ui-pagehead-sub">{subtitle}</p>}
      </div>
      {actions && <div className="ui-pagehead-actions">{actions}</div>}
    </header>
  )
}
