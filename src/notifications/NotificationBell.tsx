import { IconBell, IconBellOff, IconClose } from "../primitives/Icon"
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { cn } from "../cn"
import { Button } from "../primitives/Button"

export interface NotificationItem {
  id: string
  icon?: ReactNode
  title: ReactNode
  body?: ReactNode
  time?: ReactNode
  /** Where it came from, shown before the time ("ESPN", "League"). */
  source?: ReactNode
  /** When it happened (ISO): splits the list into Today and Earlier. */
  at?: string | null
  /** Not yet read: a dot, and the title in the strong weight. Unset means unread. */
  unread?: boolean
}

/** A secondary action on every row, e.g. "Open in chat →". */
export interface NotificationAction {
  label: ReactNode
  onClick: (item: NotificationItem) => void
}

interface Props {
  items: NotificationItem[]
  /** Called when an item is tapped (typically to mark it read + navigate). */
  onItemClick?: (item: NotificationItem) => void
  onDismissAll?: () => void
  onMarkAllRead?: () => void
  /** Dismiss one: a swipe left, or Delete on the focused row. */
  onDismiss?: (item: NotificationItem) => void
  action?: NotificationAction
  /** The empty sheet's way to the app's notification settings. */
  settings?: { label?: ReactNode; onClick: () => void }
  empty?: string
  className?: string
}

const ENGAGE = 10
const DISMISS_AT = 0.4
const FLICK_PX_PER_MS = 0.6
const FLICK_MIN = 48
const LEAVE_MS = 180

const isToday = (iso?: string | null) => {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

const reducedMotion = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)

/**
 * One notification: tap it to go to the thing, swipe it left to be rid of
 * it — Family Hub's row (2026-10-02), where the whole row is the handle the
 * way a phone's own list works. Delete dismisses the focused row.
 */
function Row({ item, onOpen, onDismiss, action, onAction }: {
  item: NotificationItem
  onOpen: (item: NotificationItem) => void
  onDismiss?: (item: NotificationItem) => void
  action?: NotificationAction
  onAction: (item: NotificationItem) => void
}) {
  const [dx, setDx] = useState(0)
  const [phase, setPhase] = useState<"rest" | "drag" | "settle" | "leaving">("rest")
  const [span, setSpan] = useState(0)
  const gesture = useRef<{ id: number; x: number; y: number; t: number; width: number; mode: "pending" | "swipe" } | null>(null)
  const swallow = useRef(false)
  const row = useRef<HTMLLIElement>(null)

  function leave() {
    if (!onDismiss || phase === "leaving") return
    const li = row.current
    if (!li || reducedMotion()) { onDismiss(item); return }
    setPhase("leaving")
    setDx(-li.offsetWidth)
    li.style.height = `${li.offsetHeight}px`
    window.setTimeout(() => {
      li.style.height = "0px"
      window.setTimeout(() => onDismiss(item), LEAVE_MS)
    }, LEAVE_MS)
  }

  function down(e: PointerEvent<HTMLDivElement>) {
    if (!onDismiss || (e.pointerType === "mouse" && e.button !== 0) || phase === "leaving") return
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, width: e.currentTarget.offsetWidth, mode: "pending" }
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current
    if (!g || e.pointerId !== g.id) return
    const across = e.clientX - g.x
    const downBy = e.clientY - g.y
    if (g.mode === "pending") {
      if (Math.abs(downBy) > ENGAGE && Math.abs(downBy) >= Math.abs(across)) { gesture.current = null; return }
      if (Math.abs(across) <= ENGAGE) return
      g.mode = "swipe"
      e.currentTarget.setPointerCapture?.(e.pointerId)
      setSpan(g.width)
      setPhase("drag")
    }
    // Left is the only way it goes; right gives a little and springs back.
    setDx(across < 0 ? across : across * 0.15)
  }

  function up(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current
    gesture.current = null
    if (!g || g.mode !== "swipe") return
    swallow.current = true
    const travelled = e.clientX - g.x
    const speed = -travelled / Math.max(1, e.timeStamp - g.t)
    if (-travelled > g.width * DISMISS_AT || (-travelled > FLICK_MIN && speed > FLICK_PX_PER_MS)) leave()
    else { setPhase("settle"); setDx(0) }
  }

  function cancel() {
    gesture.current = null
    if (phase === "drag") { setPhase("settle"); setDx(0) }
  }

  function open() {
    if (swallow.current) { swallow.current = false; return }
    onOpen(item)
  }

  function key(e: KeyboardEvent<HTMLButtonElement>) {
    if (!onDismiss || (e.key !== "Delete" && e.key !== "Backspace")) return
    e.preventDefault()
    const next = row.current?.nextElementSibling?.querySelector<HTMLButtonElement>(".ui-notif-open")
      ?? row.current?.previousElementSibling?.querySelector<HTMLButtonElement>(".ui-notif-open")
    next?.focus()
    leave()
  }

  const armed = phase === "drag" && span > 0 && -dx > span * DISMISS_AT
  const unread = item.unread !== false
  const meta = item.source != null || item.time != null

  return (
    <li ref={row} className={cn("ui-notif-row", unread && "is-unread", phase === "leaving" && "is-leaving")}>
      <div className="ui-notif-track">
        {onDismiss && (
          <div className={cn("ui-notif-under", armed && "is-armed")} aria-hidden="true" style={{ opacity: dx < 0 ? Math.min(1, -dx / 60) : 0 }}>
            {armed ? "Let go" : "Dismiss"}
          </div>
        )}
        <div
          className={cn("ui-notif-face", `ui-notif-face--${phase}`)}
          style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={cancel}
          onTransitionEnd={() => { if (phase === "settle") setPhase("rest") }}
        >
          <button type="button" className="ui-notif-open" onClick={open} onKeyDown={key} aria-keyshortcuts={onDismiss ? "Delete" : undefined}>
            <span className="ui-notif-dot" aria-hidden="true" />
            {item.icon && <span className="ui-notif-icon" aria-hidden="true">{item.icon}</span>}
            <span className="ui-notif-text">
              <span className="ui-notif-title">{item.title}</span>
              {item.body && <span className="ui-notif-body">{item.body}</span>}
              {meta && (
                <span className="ui-notif-meta">
                  {item.source != null && <span className="ui-notif-source">{item.source}</span>}
                  {item.source != null && item.time != null && " · "}
                  {item.time}
                </span>
              )}
            </span>
          </button>
          {action && (
            <button type="button" className="ui-notif-action" onClick={() => onAction(item)}>{action.label}</button>
          )}
        </div>
      </div>
    </li>
  )
}

/**
 * The bell, its count, and the sheet it opens — Family Hub's (2026-10-02),
 * shared by the sports apps. It was a small dropdown hung off the bell: on a
 * phone, tiny type and a corner ✕. Now on a phone it is a sheet the full width
 * of the screen from under the bar to the bottom, rows at the phone's type
 * scale, its actions real buttons at the top, and the list split into Today
 * and Earlier; a desktop keeps a popover under the bell. Drawn into <body>
 * so no bar's rules reach into it.
 */
export function NotificationBell({ items, onItemClick, onDismissAll, onMarkAllRead, onDismiss, action, settings, empty = "You're all caught up.", className }: Props) {
  const [open, setOpen] = useState(false)
  // Where the bar ends: the sheet hangs from there, whatever height the
  // app's bar and the phone's notch make it.
  const [top, setTop] = useState(56)
  const bell = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLElement>(null)
  const unread = items.filter((n) => n.unread !== false).length

  const close = useCallback(() => {
    setOpen(false)
    bell.current?.focus({ preventScroll: true })
  }, [])

  // While open the sheet owns the touch: the page does not scroll behind it,
  // and Escape closes it.
  useEffect(() => {
    if (!open) return undefined
    sheet.current?.querySelector<HTMLElement>(".ui-notif-heading")?.focus()
    const body = document.body
    const was = { overflow: body.style.overflow, swiping: body.dataset.swiping }
    body.style.overflow = "hidden"
    body.dataset.swiping = "true"
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    return () => {
      body.style.overflow = was.overflow
      if (was.swiping === undefined) delete body.dataset.swiping
      else body.dataset.swiping = was.swiping
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  const openItem = (item: NotificationItem) => { setOpen(false); onItemClick?.(item) }
  const runAction = (item: NotificationItem) => { setOpen(false); action?.onClick(item) }

  const dated = items.some((n) => n.at)
  const groups = dated
    ? [{ label: "Today", rows: items.filter((n) => isToday(n.at)) }, { label: "Earlier", rows: items.filter((n) => !isToday(n.at)) }]
    : [{ label: null, rows: items }]

  return (
    <div className={cn("ui-bell", className)}>
      <button
        ref={bell}
        type="button"
        className={cn("ui-bell-btn", open && "is-open")}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) { close(); return }
          const bar = bell.current?.closest(".ui-nav") ?? bell.current
          setTop(Math.round(bar?.getBoundingClientRect().bottom ?? 56))
          setOpen(true)
        }}
      >
        <IconBell className="ui-bell-icon" size={18} />
        {unread > 0 && <span className="ui-bell-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="ui-notif-scrim" onClick={close} aria-hidden="true" style={{ "--ui-notif-top": `${top}px` } as CSSProperties} />
          <section ref={sheet} className="ui-notif-sheet" role="dialog" aria-modal="true" aria-labelledby="ui-notif-heading"
                   style={{ "--ui-notif-top": `${top}px` } as CSSProperties}>
            <header className="ui-notif-head">
              <h2 id="ui-notif-heading" className="ui-notif-heading" tabIndex={-1}>Notifications</h2>
              {unread > 0 && <span className="ui-notif-count">{unread} unread</span>}
              <button type="button" className="ui-notif-close" onClick={close} aria-label="Close notifications">
                <IconClose size={18} />
              </button>
            </header>

            {items.length > 0 && (onMarkAllRead || onDismissAll) && (
              <div className="ui-notif-tools">
                {onMarkAllRead && <Button size="sm" onClick={onMarkAllRead} disabled={unread === 0}>Mark all read</Button>}
                {onDismissAll && <Button size="sm" onClick={onDismissAll}>Clear all</Button>}
              </div>
            )}

            <div className="ui-notif-scroll">
              {items.length === 0 ? (
                <div className="ui-notif-empty">
                  <IconBellOff className="ui-notif-empty-icon" size={28} />
                  <p className="ui-notif-empty-title">{empty}</p>
                  {settings && (
                    <Button size="sm" onClick={() => { setOpen(false); settings.onClick() }}>{settings.label ?? "Choose what you hear about"}</Button>
                  )}
                </div>
              ) : (
                groups.map((g) => g.rows.length > 0 && (
                  <section key={g.label ?? "all"} className="ui-notif-group" aria-label={g.label ?? undefined}>
                    {g.label && <h3 className="ui-notif-group-head">{g.label}</h3>}
                    <ul className="ui-notif-list">
                      {g.rows.map((n) => (
                        <Row key={n.id} item={n} onOpen={openItem} onDismiss={onDismiss} action={action} onAction={runAction} />
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </section>
        </>,
        document.body,
      )}
    </div>
  )
}
