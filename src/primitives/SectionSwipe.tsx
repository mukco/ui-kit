import { useEffect } from "react"
import { ArrowLeft } from "pixelarticons/react"
import type { TabBarTab } from "./TabBar"

/**
 * Family Hub's sideways swipe (its web/src/shell/useAppSwipe.ts), for the
 * sports apps: swipe left or right to walk to the next or previous section —
 * the same sections, in the same order, as the phone tab bar — and on a page
 * inside a section (a game, a player, a team) a swipe right is Back.
 *
 * The page follows the finger 1:1; the strip it uncovers shows where letting
 * go will take you (SwipeBand). Past a quarter of the screen, or flicked, it
 * goes; otherwise it springs back. On an inner page, a swipe right short of
 * BACK_TO_SECTION is Back and a longer one is the previous section.
 *
 * The hard part is leaving sideways scrollers alone: a gesture that begins
 * inside anything that scrolls sideways (a stats table, a tab strip, a
 * carousel) belongs to it while it can still scroll that way, and passes on
 * at its end, the way an iPhone app's do. Charts (touch shows their
 * tooltips), the SQL editor, the assistant, drawers and dialogs never swipe.
 *
 * Mark the element that moves — the page's main area, between the bars —
 * with data-swipe-content, and render <SwipeBand> once. Home-screen apps get
 * no native swipe-back on iOS, which is why this exists.
 */

const LOCK = 10 // px before the gesture is decided
const HORIZONTAL = 1.8 // |dx| must beat |dy| by this much — a swipe, not a scroll
const FLICK = 0.5 // px per ms over the last ~150ms
const BACK_TO_SECTION = 0.6
const SPRING = "transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)"
const AWAY = "transform 0.2s ease-in"
const EDGE = 24
const NEVER = [
  ".ph-tabbar", ".ui-nav", ".ui-drawer", "[aria-modal='true']", "input[type='range']",
  ".recharts-wrapper", ".echarts-for-react", "canvas", ".cm-editor", ".ui-fa-panel", ".ui-fa-launcher",
  "[data-noswipe]",
].join(", ")

export interface SectionSwipeOptions {
  sections: TabBarTab[]
  pathname: string
  onNavigate: (to: string) => void
  /** Back from an inner page (the app's router: navigate(-1)). */
  onBack: () => void
  /** Off where swiping makes no sense (a full-screen editor, say). */
  enabled?: boolean
}

const still = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)

function sectionIndex(sections: TabBarTab[], pathname: string) {
  return sections.findIndex((t) => t.match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`))))
}

export function useSectionSwipe({ sections, pathname, onNavigate, onBack, enabled = true }: SectionSwipeOptions) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("ontouchstart" in window)) return
    const index = sectionIndex(sections, pathname)
    // An inner page: inside a section but not its own landing page.
    const inner = index !== -1 ? sections[index].to !== pathname : true
    const count = sections.length

    type Drag = { x: number; y: number; mode: "side" | null; trail: { x: number; t: number }[]; scroller: HTMLElement | null }
    let drag: Drag | null = null

    const content = () => document.querySelector<HTMLElement>("[data-swipe-content]")
    const band = () => document.querySelector<HTMLElement>(".ui-swipeband")

    const sideScroller = (target: EventTarget | null) => {
      let node = target as HTMLElement | null
      while (node && node !== document.body) {
        if (node.nodeType === 1) {
          const style = getComputedStyle(node)
          if ((style.overflowX === "auto" || style.overflowX === "scroll") && node.scrollWidth > node.clientWidth + 2) return node
        }
        node = node.parentElement
      }
      return null
    }
    const canScroll = (el: HTMLElement, dx: number) =>
      dx < 0 ? el.scrollLeft + el.clientWidth < el.scrollWidth - 2 : el.scrollLeft > 2

    const place = (transform: string, transition = "none") => {
      const el = content()
      if (!el) return
      el.style.transition = transition
      el.style.transform = transform
      // Lifted over the band, and opaque, while it moves.
      el.style.position = transform ? "relative" : ""
      el.style.zIndex = transform ? "2" : ""
      el.style.background = transform ? "var(--bg)" : ""
      el.style.willChange = transform ? "transform" : ""
    }

    // Where letting go here goes: "back", or a section index.
    const aimOf = (dx: number): "back" | number | null => {
      if (dx > 0 && inner && (index === -1 || dx < window.innerWidth * BACK_TO_SECTION)) return "back"
      if (index === -1) return null
      return dx < 0 ? (index + 1) % count : (index - 1 + count) % count
    }

    const slideBand = (dx: number, transition = "none") => {
      const b = band()
      if (!b) return
      const w = window.innerWidth
      const shown = Math.min(w, Math.abs(dx))
      b.style.transition = transition
      b.style.transform = `translateX(${dx < 0 ? w - shown : shown - w}px)`
      const ring = b.querySelector<HTMLElement>(".ui-swipeband-ring")
      if (ring) {
        ring.style.transition = transition
        ring.style.transform = `translateX(${(dx < 0 ? shown / 2 : w - shown / 2) - w / 2}px)`
      }
    }
    const showBand = (dx: number) => {
      const b = band()
      const aim = aimOf(dx)
      if (!b || aim === null) return
      const shown = aim === "back" ? "__back" : sections[aim].to
      if (b.dataset.to !== shown && b.dataset.to && !still()) {
        b.classList.remove("is-pop"); void b.offsetWidth; b.classList.add("is-pop")
      }
      b.dataset.to = shown
      b.querySelectorAll<HTMLElement>(".ui-swipeband-icon").forEach((icon) => icon.toggleAttribute("data-on", icon.dataset.to === shown))
      b.dataset.ready = Math.abs(dx) > window.innerWidth * 0.25 ? "true" : "false"
      b.style.setProperty("--p", String(Math.min(1, Math.abs(dx) / (window.innerWidth * 0.25))))
      slideBand(dx)
    }
    const hideBand = (transition = "none") => {
      const b = band()
      if (!b) return
      slideBand(-0.0001, transition)
      b.dataset.ready = "false"
    }
    const reset = () => { place(""); hideBand() }

    const onStart = (event: TouchEvent) => {
      drag = null
      if (event.touches.length !== 1) return
      const target = event.target instanceof Element ? event.target : null
      if (!target || target.closest(NEVER)) return
      if (!target.closest("[data-swipe-content]")) return
      const touch = event.touches[0]
      drag = { x: touch.clientX, y: touch.clientY, mode: null, trail: [{ x: touch.clientX, t: event.timeStamp }], scroller: sideScroller(target) }
    }

    const onMove = (event: TouchEvent) => {
      const d = drag
      const touch = event.touches[0]
      if (!d || !touch) return
      const dx = touch.clientX - d.x
      const dy = touch.clientY - d.y
      if (!d.mode) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK) return
        if (d.scroller && canScroll(d.scroller, dx)) { drag = null; return }
        if (aimOf(dx) !== null && Math.abs(dx) >= Math.abs(dy) * HORIZONTAL) d.mode = "side"
        else { drag = null; return }
      }
      d.trail.push({ x: touch.clientX, t: event.timeStamp })
      while (d.trail.length > 2 && event.timeStamp - d.trail[0].t > 150) d.trail.shift()
      place(`translateX(${dx}px)`)
      showBand(dx)
    }

    const onEnd = (event: TouchEvent) => {
      const d = drag
      drag = null
      if (!d || !d.mode) return
      const touch = event.changedTouches[0]
      if (!touch) { reset(); return }
      const dx = touch.clientX - d.x
      const first = d.trail[0], last = d.trail[d.trail.length - 1]
      const span = last.t - first.t
      const speed = span > 0 ? (last.x - first.x) / span : 0
      const go = Math.abs(dx) > window.innerWidth * 0.25 || (Math.abs(speed) > FLICK && Math.sign(speed) === Math.sign(dx) && Math.abs(dx) > LOCK * 2)
      const aim = aimOf(dx)
      if (!go || aim === null) { place("", still() ? "none" : SPRING); hideBand(still() ? "none" : SPRING); return }

      const leave = () => {
        // Which way the page arrives from: the side the thumb pushed toward.
        const root = document.documentElement
        root.dataset.swipeArrive = dx < 0 ? "fwd" : "back"
        window.setTimeout(() => { delete root.dataset.swipeArrive }, 600)
        if (aim === "back") onBack()
        else onNavigate(sections[aim].to)
        requestAnimationFrame(() => requestAnimationFrame(reset))
      }
      if (still()) { leave(); return }
      const b = band(); if (b) b.dataset.ready = "true"
      const off = dx < 0 ? -window.innerWidth : window.innerWidth
      place(`translateX(${off}px)`, AWAY)
      slideBand(off, AWAY)
      window.setTimeout(leave, 200)
    }

    const onCancel = () => {
      if (drag?.mode) place("", still() ? "none" : SPRING)
      drag = null
      hideBand()
    }

    // In a Safari tab, iOS's own edge swipe ran at the same time as this
    // one: a touch that starts at the very edge of the page area, not on a
    // control, is kept from the browser so there is only one swipe.
    const edgeGuard = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const x = event.touches[0].clientX
      if (x > EDGE && x < window.innerWidth - EDGE) return
      const target = event.target instanceof Element ? event.target : null
      if (!target?.closest("[data-swipe-content]") || target.closest(NEVER)) return
      if (target.closest("a, button, input, select, textarea, label, [role='button'], [contenteditable='true']")) return
      if (event.cancelable) event.preventDefault()
    }

    window.addEventListener("touchstart", edgeGuard, { passive: false })
    window.addEventListener("touchstart", onStart, { passive: true })
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onEnd, { passive: true })
    window.addEventListener("touchcancel", onCancel, { passive: true })
    return () => {
      window.removeEventListener("touchstart", edgeGuard)
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
      window.removeEventListener("touchcancel", onCancel)
      reset()
    }
  }, [sections, pathname, onNavigate, onBack, enabled])
}

/**
 * The strip a sideways swipe uncovers: the destination's icon large in its
 * middle — a section's tab icon, or ← for Back — in a ring that fills toward
 * the point where letting go will act, solid once it will. Render once.
 */
export function SwipeBand({ sections }: { sections: TabBarTab[] }) {
  return (
    <div className="ui-swipeband" aria-hidden="true" data-ready="false">
      <span className="ui-swipeband-ring">
        <span className="ui-swipeband-face">
          <span className="ui-swipeband-icon" data-to="__back"><ArrowLeft className="px-icon" /></span>
          {sections.map((t) => (
            <span key={t.to} className="ui-swipeband-icon" data-to={t.to}><t.Icon className="px-icon" /></span>
          ))}
        </span>
      </span>
    </div>
  )
}

/**
 * A new page opens at its top. Without this a single-page app keeps the
 * window's scroll position across navigations, so a game opened from far
 * down Today landed halfway down the game page, on whatever sat at that
 * height (the shot chart). Back is left alone (`isBack`): returning to a
 * list should find the reader where they were, which the browser restores.
 *
 *   const { pathname } = useLocation(); const type = useNavigationType()
 *   useScrollToTop(pathname, type === "POP")
 */
export function useScrollToTop(pathname: string, isBack = false) {
  useEffect(() => {
    if (isBack || typeof window === "undefined") return
    window.scrollTo(0, 0)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
}
