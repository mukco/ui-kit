import { cn } from "../cn"

/** Centered spinner with an optional status line. */
export function Loading({
  label,
  compact = false,
  className,
}: {
  label?: string
  /** Tight variant for a container that cannot give up 2.5rem of padding. */
  compact?: boolean
  className?: string
}) {
  return (
    <div className={cn("ui-loading", compact && "ui-loading--compact", className)} role="status">
      <span className="ui-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  )
}
