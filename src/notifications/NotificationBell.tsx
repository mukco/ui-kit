import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "../cn"

export interface NotificationItem {
  id: string
  icon?: ReactNode
  title: ReactNode
  body?: ReactNode
  time?: ReactNode
}

interface Props {
  items: NotificationItem[]
  /** Called when an item is clicked (typically to dismiss + navigate). */
  onItemClick?: (item: NotificationItem) => void
  onDismissAll?: () => void
  empty?: string
  className?: string
}

/** Bell with unread badge opening a dropdown list. Items and dismissal are
    the app's business; the kit draws the affordance. */
export function NotificationBell({ items, onItemClick, onDismissAll, empty = "You're all caught up.", className }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  return (
    <div ref={rootRef} className={cn("ui-bell", className)}>
      <button type="button" className="ui-bell-btn" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {/* An SVG, not 🔔. The emoji renders in full colour on every platform
            that has it, so a nav bar of monochrome controls got one yellow
            cartoon in the middle of it — and the one control that is coloured
            reads as the important one, which a bell with nothing in it is not.
            currentColor makes it agree with its neighbours and with the theme. */}
        <svg
          className="ui-bell-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
          <path d="M13.7 20a1.9 1.9 0 0 1-3.4 0" />
        </svg>
        {items.length > 0 && <span className="ui-bell-badge">{items.length > 9 ? "9+" : items.length}</span>}
      </button>

      {open && (
        <div className="ui-bell-panel">
          <div className="ui-bell-head">
            <p className="ui-bell-head-title">Notifications</p>
            {onDismissAll && items.length > 0 && (
              <button type="button" className="ui-bell-clear" onClick={onDismissAll}>
                Clear all
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="ui-bell-empty">{empty}</p>
          ) : (
            items.map((n) => (
              <button key={n.id} type="button" className="ui-bell-item" onClick={() => onItemClick?.(n)}>
                <span className={cn(items.length > 0 && "ui-bell-dot")} style={{ background: undefined }} aria-hidden="true" />
                {n.icon && <span className="ui-bell-item-icon">{n.icon}</span>}
                <span className="ui-bell-item-body">
                  <span className="ui-bell-item-title">{n.title}</span>
                  {n.body && <span className="ui-bell-item-body-text">{n.body}</span>}
                  {n.time && <span className="ui-bell-item-time">{n.time}</span>}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
