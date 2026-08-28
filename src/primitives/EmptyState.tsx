import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  icon?: ReactNode
  children: ReactNode
  /**
   * Tight variant for a container that cannot give up 2.5rem — a fixed-height
   * popover, a table cell, an inline row. Without it an app with nowhere to put
   * the full block hand-rolls a small one instead, which is exactly how these
   * states diverged between apps.
   */
  compact?: boolean
  className?: string
}

/** A friendly nothing-here block. */
export function EmptyState({ icon = "∅", children, compact = false, className }: Props) {
  return (
    // role="status" to match Loading. They occupy the same slot and replace
    // each other as a fetch resolves; announcing one and not the other meant a
    // screen reader heard "Loading…" and then silence.
    <div className={cn("ui-empty", compact && "ui-empty--compact", className)} role="status">
      <span className="ui-empty-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  )
}
