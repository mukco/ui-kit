import { IconBell, IconBellOff, IconClose } from "../primitives/Icon"
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { cn } from "../cn"
import { Button } from "../primitives/Button"
import { Skeleton } from "../primitives/Skeleton"

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

/** Icons the sheet draws, for an app that wants its own (Family Hub's pixel set). Unset: the kit's line icons, or none. */
export interface NotificationIcons {
  /** The close key in the sheet's header. */
  close?: ReactNode
  /** Over the empty sheet. */
  empty?: ReactNode
  /** In the Mark all read key. */
  markAllRead?: ReactNode
  /** In the Clear all key. */
  clearAll?: ReactNode
  /** Beside "Dismiss" under a row being swiped. */
  dismiss?: ReactNode
}

/** The sheet's options, shared by NotificationBell and NotificationSheet. All optional; unset is the sports apps' sheet. */
export interface NotificationSheetOptions {
  items: NotificationItem[]
  /** Called when an item is tapped (typically to mark it read + navigate). */
  onItemClick?: (item: NotificationItem) => void
  onDismissAll?: () => void
  onMarkAllRead?: () => void
  /** Dismiss one: a swipe left, or Delete on the focused row. */
  onDismiss?: (item: NotificationItem) => void
  action?: NotificationAction
  /** The empty sheet's way to the app's notification settings. With `href` it is a link (a plain click still calls onClick, which should navigate). */
  settings?: { label?: ReactNode; onClick: () => void; href?: string }
  empty?: string
  /** A line under the empty sheet's title. */
  emptyText?: ReactNode
  /** The unread count when the app knows better than the items it passed (a server that lists 50 but counts all). */
  unreadCount?: number
  /** Still fetching and nothing to show yet: `loadingContent` (or a skeleton) in place of the list. */
  loading?: boolean
  loadingContent?: ReactNode
  /** The last fetch failed. With no items: a failed state (role alert) with Retry; with items: a line saying they may be stale. */
  failed?: boolean
  onRetry?: () => void
  /** The failed state's line under its title. */
  failedText?: ReactNode
  /** A line under the list ("Tap one to go to it; swipe it left to dismiss it."). */
  hint?: ReactNode
  icons?: NotificationIcons
  /** Each row's time on the title's line, at the right (Family Hub), rather than under the body with the source. */
  timeInTitle?: boolean
  /** Which items go under Today (default: the same calendar date as now). */
  isToday?: (at: string) => boolean
}

interface Props extends NotificationSheetOptions {
  /** The bell's own icon (default: the kit's line bell). */
  icon?: ReactNode
  /** The sheet opened: fetch the list now, say. */
  onOpen?: () => void
  className?: string
}

export interface NotificationSheetProps extends NotificationSheetOptions {
  /** Close it (Escape, the close key, the scrim, a row tapped). */
  onClose: () => void
  /** The dialog's id, for the trigger's aria-controls. */
  id?: string
  /** After the page's scroll is unlocked on close (an app that must repaint fixed bars on iOS). */
  onUnlocked?: () => void
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
function Row({ item, onOpen, onDismiss, action, onAction, dismissIcon, timeInTitle }: {
  item: NotificationItem
  onOpen: (item: NotificationItem) => void
  onDismiss?: (item: NotificationItem) => void
  action?: NotificationAction
  onAction: (item: NotificationItem) => void
  dismissIcon?: ReactNode
  timeInTitle?: boolean
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
  const meta = item.source != null || (!timeInTitle && item.time != null)

  return (
    <li ref={row} className={cn("ui-notif-row", unread && "is-unread", phase === "leaving" && "is-leaving")}>
      <div className="ui-notif-track">
        {onDismiss && (
          <div className={cn("ui-notif-under", armed && "is-armed")} aria-hidden="true" style={{ opacity: dx < 0 ? Math.min(1, -dx / 60) : 0 }}>
            <span className="ui-notif-under-label">{dismissIcon}{armed ? "Let go" : "Dismiss"}</span>
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
              {timeInTitle ? (
                <span className="ui-notif-titleline">
                  {unread && <span className="ui-sr-only">Unread: </span>}
                  <span className="ui-notif-title">{item.title}</span>
                  {item.time}
                </span>
              ) : (
                <span className="ui-notif-title">{unread && <span className="ui-sr-only">Unread: </span>}{item.title}</span>
              )}
              {item.body && <span className="ui-notif-body">{item.body}</span>}
              {meta && (
                <span className="ui-notif-meta">
                  {item.source != null && <span className="ui-notif-source">{item.source}</span>}
                  {item.source != null && !timeInTitle && item.time != null && " · "}
                  {!timeInTitle && item.time}
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

const countUnread = (items: NotificationItem[]) => items.filter((n) => n.unread !== false).length

/**
 * The bell's sheet on its own, for an app that draws its own bell (Family
 * Hub's sits in its menu bar). Render it while open — into <body>, so no
 * bar's rules reach into it. While mounted it owns the touch: the page does
 * not scroll behind it, body[data-swiping] tells the app's gestures to stand
 * down, focus is on its heading, and Escape closes it.
 */
export function NotificationSheet({
  items, onClose, onItemClick, onDismissAll, onMarkAllRead, onDismiss, action, settings, empty = "You're all caught up.",
  emptyText, unreadCount, loading, loadingContent, failed, onRetry, failedText, hint, icons, timeInTitle, id, onUnlocked, top, isToday: today = isToday,
}: NotificationSheetProps & { top?: number }) {
  const sheet = useRef<HTMLElement>(null)
  const unread = unreadCount ?? countUnread(items)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const unlockedRef = useRef(onUnlocked)
  unlockedRef.current = onUnlocked

  useEffect(() => {
    sheet.current?.querySelector<HTMLElement>(".ui-notif-heading")?.focus()
    const body = document.body
    const was = { overflow: body.style.overflow, swiping: body.dataset.swiping }
    body.style.overflow = "hidden"
    body.dataset.swiping = "true"
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") closeRef.current() }
    document.addEventListener("keydown", onKey)
    return () => {
      body.style.overflow = was.overflow
      if (was.swiping === undefined) delete body.dataset.swiping
      else body.dataset.swiping = was.swiping
      document.removeEventListener("keydown", onKey)
      unlockedRef.current?.()
    }
  }, [])

  const openItem = (item: NotificationItem) => { onClose(); onItemClick?.(item) }
  const runAction = (item: NotificationItem) => { onClose(); action?.onClick(item) }

  const dated = items.some((n) => n.at)
  const groups = dated
    ? [{ label: "Today", rows: items.filter((n) => !!n.at && today(n.at)) }, { label: "Earlier", rows: items.filter((n) => !n.at || !today(n.at)) }]
    : [{ label: null, rows: items }]
  const topStyle = top === undefined ? undefined : ({ "--ui-notif-top": `${top}px` } as CSSProperties)
  const settingsLabel = settings?.label ?? "Choose what you hear about"

  return (
    <>
      <div className="ui-notif-scrim" onClick={onClose} aria-hidden="true" style={topStyle} />
      <section ref={sheet} id={id} className="ui-notif-sheet" role="dialog" aria-modal="true" aria-labelledby="ui-notif-heading" style={topStyle}>
        <header className="ui-notif-head">
          <h2 id="ui-notif-heading" className="ui-notif-heading" tabIndex={-1}>Notifications</h2>
          {unread > 0 && <span className="ui-notif-count">{unread} unread</span>}
          <button type="button" className="ui-notif-close" onClick={onClose} aria-label="Close notifications">
            {icons?.close ?? <IconClose size={18} />}
          </button>
        </header>

        {items.length > 0 && (onMarkAllRead || onDismissAll) && (
          <div className="ui-notif-tools">
            {onMarkAllRead && <Button size="sm" onClick={onMarkAllRead} disabled={unread === 0}>{icons?.markAllRead}Mark all read</Button>}
            {onDismissAll && <Button size="sm" onClick={onDismissAll}>{icons?.clearAll}Clear all</Button>}
          </div>
        )}

        <div className="ui-notif-scroll">
          {items.length === 0 && loading && !failed ? (
            <div className="ui-notif-loading">{loadingContent ?? <Skeleton lines={5} />}</div>
          ) : items.length === 0 && failed ? (
            <div className="ui-notif-empty ui-notif-failed" role="alert">
              <p className="ui-notif-empty-title">Couldn't load notifications.</p>
              <p className="ui-notif-empty-text">{failedText ?? "The server didn't answer. Check the connection and try again."}</p>
              {onRetry && <Button size="sm" className="ui-notif-retry" onClick={onRetry}>Retry</Button>}
            </div>
          ) : items.length === 0 ? (
            <div className="ui-notif-empty">
              {icons?.empty ?? <IconBellOff className="ui-notif-empty-icon" size={28} />}
              <p className="ui-notif-empty-title">{empty}</p>
              {emptyText && <p className="ui-notif-empty-text">{emptyText}</p>}
              {settings && (settings.href ? (
                <a className="ui-btn ui-btn--sm ui-notif-settings" href={settings.href} onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                  e.preventDefault(); onClose(); settings.onClick()
                }}>{settingsLabel}</a>
              ) : (
                <Button size="sm" className="ui-notif-settings" onClick={() => { onClose(); settings.onClick() }}>{settingsLabel}</Button>
              ))}
            </div>
          ) : (
            groups.map((g) => g.rows.length > 0 && (
              <section key={g.label ?? "all"} className="ui-notif-group" aria-label={g.label ?? undefined}>
                {g.label && <h3 className="ui-notif-group-head">{g.label}</h3>}
                <ul className="ui-notif-list">
                  {g.rows.map((n) => (
                    <Row key={n.id} item={n} onOpen={openItem} onDismiss={onDismiss} action={action} onAction={runAction}
                         dismissIcon={icons?.dismiss} timeInTitle={timeInTitle} />
                  ))}
                </ul>
              </section>
            ))
          )}

          {items.length > 0 && failed && (
            <p className="ui-notif-stale" role="status">
              Couldn't check for new ones.{" "}
              {onRetry && <Button size="sm" className="ui-notif-retry ui-notif-retry--inline" onClick={onRetry}>Retry</Button>}
            </p>
          )}
          {items.length > 0 && hint && <p className="ui-notif-hint">{hint}</p>}
        </div>
      </section>
    </>
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
export function NotificationBell({ icon, onOpen, className, ...sheet }: Props) {
  const [open, setOpen] = useState(false)
  // Where the bar ends: the sheet hangs from there, whatever height the
  // app's bar and the phone's notch make it.
  const [top, setTop] = useState(56)
  const bell = useRef<HTMLButtonElement>(null)
  const unread = sheet.unreadCount ?? countUnread(sheet.items)

  const close = useCallback(() => {
    setOpen(false)
    bell.current?.focus({ preventScroll: true })
  }, [])

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
          onOpen?.()
        }}
      >
        {icon ?? <IconBell className="ui-bell-icon" size={18} />}
        {unread > 0 && <span className="ui-bell-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && typeof document !== "undefined" && createPortal(<NotificationSheet {...sheet} onClose={close} top={top} />, document.body)}
    </div>
  )
}
