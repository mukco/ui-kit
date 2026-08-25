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
        🔔
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
