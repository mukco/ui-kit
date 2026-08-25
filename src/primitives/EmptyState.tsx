import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/** A friendly nothing-here block. */
export function EmptyState({ icon = "∅", children, className }: Props) {
  return (
    <div className={cn("ui-empty", className)}>
      <span className="ui-empty-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  )
}
