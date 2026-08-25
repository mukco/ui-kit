import { cn } from "../cn"

/** Centered spinner with an optional status line. */
export function Loading({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("ui-loading", className)} role="status">
      <span className="ui-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  )
}
