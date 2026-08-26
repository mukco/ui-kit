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
    // role="status" to match Loading. They occupy the same slot and replace
    // each other as a fetch resolves; announcing one and not the other meant a
    // screen reader heard "Loading…" and then silence.
    <div className={cn("ui-empty", className)} role="status">
      <span className="ui-empty-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  )
}
