import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { MoreHorizontal } from "pixelarticons/react"
import type { PixelIcon } from "./Pixel"
import { fitTabs, moreSections, shownTabs } from "./tabFit"

/**
 * The phone tab bar for the Phosphor skin: the app's places along the foot of
 * the screen. Always rendered; ui-kit/phosphor.css shows it only under
 * Phosphor at phone width. The app owns routing: pass the current path and a
 * navigate.
 *
 * The tabs share the bar in equal slots with More last, so every app's bar is
 * spaced the same. The bar holds as many tabs as fit with their labels whole
 * at the current width and text size — the page you are on always among them —
 * and the rest head the More sheet. It re-fits when the bar's room or the
 * labels' size changes (window, web font, text size, skin) and on navigation.
 * Exactly one thing reads as active: the current tab, or More while its sheet
 * is open or when the current page lives under it.
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
  /** Every section, in order. Those that do not fit move to the top of More. */
  tabs: TabBarTab[]
  pathname: string
  onNavigate: (to: string) => void
  label?: string
  /**
   * More's own content: the places only the nav bar's menu reaches (items) and
   * the session controls (footer). Under Phosphor the tab bar replaces that
   * menu on a phone. An item whose path is also a tab is dropped, since the
   * tab is in the bar or already at the top of the sheet.
   */
  more?: { items: TabBarMoreItem[]; footer?: ReactNode }
  /** Heads the tabs that did not fit, at the top of More (the same word in every app). */
  overflowHeading?: string
}

const under = (pathname: string, m: string) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`))

interface Measure { widths: number[]; moreWidth: number; room: number; gap: number }

const same = (a: Measure | null, b: Measure) =>
  !!a && a.room === b.room && a.gap === b.gap && a.moreWidth === b.moreWidth &&
  a.widths.length === b.widths.length && a.widths.every((w, i) => w === b.widths[i])

export function TabBar({ tabs, pathname, onNavigate, label = "Sections", more, overflowHeading = "Sections" }: TabBarProps) {
  const [open, setOpen] = useState(false)
  const [m, setM] = useState<Measure | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const ruler = useRef<HTMLDivElement>(null)

  // Every label at its natural width, measured off a hidden row of the same
  // frames, and the room the slots share.
  const measure = useCallback(() => {
    const t = track.current, r = ruler.current
    if (!t || !r) return
    const frames = [...r.children] as HTMLElement[]
    const w = (el?: HTMLElement) => (el ? Math.ceil(el.getBoundingClientRect().width) : 0)
    const next: Measure = {
      widths: frames.slice(0, -1).map((el) => w(el)),
      moreWidth: w(frames[frames.length - 1]),
      room: Math.floor(t.clientWidth),
      gap: parseFloat(getComputedStyle(t).columnGap) || 0,
    }
    setM((prev) => (same(prev, next) ? prev : next))
  }, [])

  // The first render shows every tab; this re-fits before paint, so the bar
  // never flashes the unfitted row.
  useLayoutEffect(measure, [measure, tabs])
  useEffect(() => {
    // The bar's room (window, the skin showing the bar) and the ruler's size
    // (a late web font, the text-size setting) both re-fit.
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure)
    if (track.current) ro?.observe(track.current)
    if (ruler.current) ro?.observe(ruler.current)
    window.addEventListener("resize", measure)
    void document.fonts?.ready.then(measure)
    document.fonts?.addEventListener?.("loadingdone", measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener("resize", measure)
      document.fonts?.removeEventListener?.("loadingdone", measure)
    }
  }, [measure])

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const hereIdx = tabs.findIndex((t) => t.match.some((p) => under(pathname, p)))
  const extra = (more?.items ?? []).filter((i) => !tabs.some((t) => t.to === i.to))
  const alwaysMore = !!more
  const count = m && m.widths.length === tabs.length ? fitTabs({ ...m, here: hereIdx, alwaysMore }) : tabs.length
  const shownIdx = shownTabs(tabs.length, count, hereIdx)
  const overflow = tabs.filter((_, i) => !shownIdx.includes(i))
  const hasMore = alwaysMore || overflow.length > 0
  const hereShown = shownIdx.includes(hereIdx)
  const moreActive = open || (!hereShown && (hereIdx >= 0 || extra.some((i) => under(pathname, i.to))))
  const sections = moreSections(overflow, more?.items ?? [], tabs, pathname, overflowHeading)

  const go = (to: string) => { setOpen(false); onNavigate(to) }
  return (
    <>
      <nav className="ph-tabbar" aria-label={label}>
        <div className="ph-tabbar-track" ref={track}>
          {shownIdx.map((i) => {
            const t = tabs[i]
            const here = i === hereIdx
            return (
              // While More's sheet is open only More is framed; the page's tab
              // keeps aria-current, which is still true.
              <button key={t.to} type="button" className={`ph-tab${here && !open ? " ph-tab--here" : ""}`} aria-current={here ? "page" : undefined} onClick={() => go(t.to)}>
                <t.Icon className="ph-tab-icon" aria-hidden="true" /><span className="ph-tab-label">{t.label}</span>
              </button>
            )
          })}
          {hasMore && (
            <button type="button" className={`ph-tab ph-tab--more${moreActive ? " ph-tab--here" : ""}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((v) => !v)}>
              <MoreHorizontal className="ph-tab-icon" aria-hidden="true" /><span className="ph-tab-label">More</span>
            </button>
          )}
        </div>
        {/* The same frames at their natural width, out of sight: what each
            label needs, whichever tabs are showing. */}
        <div className="ph-tabbar-ruler" ref={ruler} aria-hidden="true">
          {tabs.map((t) => (
            <span key={t.to} className="ph-tab"><t.Icon className="ph-tab-icon" /><span className="ph-tab-label">{t.label}</span></span>
          ))}
          <span className="ph-tab"><MoreHorizontal className="ph-tab-icon" /><span className="ph-tab-label">More</span></span>
        </div>
      </nav>
      {hasMore && open && (
        <div className="ph-more" onClick={() => setOpen(false)}>
          <div className="ph-more-sheet" role="dialog" aria-modal="true" aria-label="More" onClick={(e) => e.stopPropagation()}>
            {sections.map((sec, n) => (
              <div key={n} className="ph-more-section">
                {sec.heading && <div className="ph-more-group">{sec.heading}</div>}
                <ul className="ph-more-list">
                  {sec.entries.map((i) => (
                    <li key={i.to}>
                      <button type="button" className={`ph-more-item${i.here ? " ph-more-item--here" : ""}`} aria-current={i.here ? "page" : undefined} onClick={() => go(i.to)}>
                        {i.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {more?.footer && <div className="ph-more-foot">{more.footer}</div>}
          </div>
        </div>
      )}
    </>
  )
}
