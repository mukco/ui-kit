import { useEffect, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal } from "pixelarticons/react"
import type { PixelIcon } from "./Pixel"

/**
 * Family Hub's phone tab bar, for the Phosphor skin: the app's places along
 * the foot of the screen, five and a half to a row so the half says it
 * scrolls. Always rendered; ui-kit/phosphor.css shows it only under Phosphor
 * at phone width. The app owns routing: pass the current path and a navigate.
 */
export interface TabBarTab {
  to: string
  label: string
  Icon: PixelIcon
  /** Path prefixes that light this tab ("/" matches only the root). */
  match: string[]
}

/** A place the tabs do not hold, listed under More. */
export interface TabBarMoreItem {
  to: string
  label: string
  /** Heads a run of items: "News", "Definitions". */
  group?: string
}

export interface TabBarProps {
  tabs: TabBarTab[]
  pathname: string
  onNavigate: (to: string) => void
  label?: string
  /**
   * A last tab, More, opening a sheet of the places the tabs leave out and
   * the session controls (footer). Under Phosphor the tab bar replaces the
   * nav bar's menu on a phone, so whatever only that menu reached goes here.
   */
  more?: { items: TabBarMoreItem[]; footer?: ReactNode }
}

const under = (pathname: string, m: string) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`))

export function TabBar({ tabs, pathname, onNavigate, label = "Sections", more }: TabBarProps) {
  const [open, setOpen] = useState(false)
  const here = (t: TabBarTab) => t.match.some((m) => under(pathname, m))
  const inMore = !!more && !tabs.some(here) && more.items.some((i) => under(pathname, i.to))

  const track = useRef<HTMLDivElement>(null)
  useEffect(() => setOpen(false), [pathname])
  // Keep the current tab in view: with more tabs than fit, the one you are
  // on could sit under the fade at the edge, or off it altogether.
  useEffect(() => {
    const el = track.current
    const tab = el?.querySelector<HTMLElement>(".ph-tab--here")
    if (!el || !tab) return
    const left = tab.offsetLeft - el.offsetLeft
    if (left < el.scrollLeft || left + tab.offsetWidth > el.scrollLeft + el.clientWidth - 36) {
      el.scrollLeft = Math.max(0, left - (el.clientWidth - tab.offsetWidth) / 2)
    }
  }, [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  let lastGroup: string | undefined
  return (
    <>
      <nav className="ph-tabbar" aria-label={label}>
        <div className="ph-tabbar-track" ref={track}>
          {tabs.map((t) => (
            <button key={t.to} type="button" className={`ph-tab${here(t) ? " ph-tab--here" : ""}`} aria-current={here(t) ? "page" : undefined} onClick={() => onNavigate(t.to)}>
              <t.Icon className="ph-tab-icon" aria-hidden="true" /><span>{t.label}</span>
            </button>
          ))}
        </div>
        {/* Pinned outside the scrolling track: at the end of it, More sat
            off-screen behind the tabs that scroll. */}
        {more && (
          <button type="button" className={`ph-tab ph-tab--more${inMore || open ? " ph-tab--here" : ""}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((v) => !v)}>
            <MoreHorizontal className="ph-tab-icon" aria-hidden="true" /><span>More</span>
          </button>
        )}
      </nav>
      {more && open && (
        <div className="ph-more" onClick={() => setOpen(false)}>
          <div className="ph-more-sheet" role="dialog" aria-modal="true" aria-label="More" onClick={(e) => e.stopPropagation()}>
            <ul className="ph-more-list">
              {more.items.map((i) => {
                const head = i.group && i.group !== lastGroup ? i.group : null
                lastGroup = i.group
                return (
                  <li key={i.to}>
                    {head && <div className="ph-more-group">{head}</div>}
                    <button type="button" className={`ph-more-item${under(pathname, i.to) ? " ph-more-item--here" : ""}`} onClick={() => { setOpen(false); onNavigate(i.to) }}>
                      {i.label}
                    </button>
                  </li>
                )
              })}
            </ul>
            {more.footer && <div className="ph-more-foot">{more.footer}</div>}
          </div>
        </div>
      )}
    </>
  )
}
