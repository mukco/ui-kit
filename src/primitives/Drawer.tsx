import { useEffect, type ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  open: boolean
  onClose: () => void
  side?: "left" | "right"
  /** Accessible label for the panel. */
  label?: string
  children: ReactNode
}

/** Off-canvas panel sliding over the page from either edge, with overlay. */
export function Drawer({ open, onClose, side = "right", label, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="ui-drawer-overlay" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn("ui-drawer", `ui-drawer--${side}`)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  )
}
