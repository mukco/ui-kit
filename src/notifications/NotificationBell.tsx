import { IconBell } from "../primitives/Icon"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "../cn"

export interface NotificationItem {
  id: string
  icon?: ReactNode
  title: ReactNode
  body?: ReactNode
  time?: ReactNode
  /** Where it came from, shown before the time ("ESPN", "League"). */
  source?: ReactNode
}

/** A secondary action on every row, e.g. "Open in chat →". */
export interface NotificationAction {
  label: ReactNode
  onClick: (item: NotificationItem) => void
}

interface Props {
  items: NotificationItem[]
  /** Called when an item is clicked (typically to dismiss + navigate). */
  onItemClick?: (item: NotificationItem) => void
  onDismissAll?: () => void
  /** Per-row dismiss (×). */
  onDismiss?: (item: NotificationItem) => void
  action?: NotificationAction
  empty?: string
  className?: string
}

/** Bell with unread badge opening a dropdown list. Items and dismissal are
    the app's business; the kit draws the affordance. */
export function NotificationBell({ items, onItemClick, onDismissAll, onDismiss, action, empty = "You're all caught up.", className }: Props) {
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
        {/* The kit's shared bell — this used to be a private copy of the
            same paths, which is one more place for the icon set to drift. */}
        <IconBell className="ui-bell-icon" size={18} />
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
            items.map((n) => {
              const meta = n.source != null || n.time != null
              const item = (
                <button key={n.id} type="button" className="ui-bell-item" onClick={() => onItemClick?.(n)}>
                  <span className={cn(items.length > 0 && "ui-bell-dot")} style={{ background: undefined }} aria-hidden="true" />
                  {n.icon && <span className="ui-bell-item-icon">{n.icon}</span>}
                  <span className="ui-bell-item-body">
                    <span className="ui-bell-item-title">{n.title}</span>
                    {n.body && <span className="ui-bell-item-body-text">{n.body}</span>}
                    {meta && (
                      <span className="ui-bell-item-time">
                        {n.source != null && <span className="ui-bell-item-source">{n.source}</span>}
                        {n.source != null && n.time != null && " · "}
                        {n.time}
                      </span>
                    )}
                  </span>
                </button>
              )
              if (!onDismiss && !action) return item
              // A row with its own controls: the item stays one button, and the
              // dismiss and the action sit beside it rather than inside it.
              return (
                <div key={n.id} className="ui-bell-row">
                  {item}
                  {onDismiss && (
                    <button type="button" className="ui-bell-dismiss" aria-label="Dismiss" onClick={() => onDismiss(n)}>×</button>
                  )}
                  {action && (
                    <button type="button" className="ui-bell-action" onClick={() => { action.onClick(n); setOpen(false) }}>{action.label}</button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
