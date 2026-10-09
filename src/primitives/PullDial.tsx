import { useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { ArrowBigDown, Home, Reload } from "pixelarticons/react"

/* Finger travel, in px, to each stage — Family Hub's numbers after tuning on
   a real phone (2026-10-04). A short pull refreshes; pulled on past that,
   letting go goes home. At 110 / 240 a scroll back to the top that ran on a
   little became a refresh. */
const REFRESH = 160
// Well past Refresh, so a firm refresh never runs on into Home.
const HOME = 420
// Nothing shows for the first stretch, and a pull that is more sideways than
// down is not one (it is a swipe between sections).
const DEAD = 20
// The page follows the finger at this rate, so it lags like something on a
// spring rather than sticking to the thumb.
const DAMP = 0.5
const PARK = 56 // how far the page stays down while a refresh runs
const SETTLE = "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s"
const still = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

// Things that own the touch: dialogs and sheets, drawers, the assistant,
// charts, editors, and anything an app marks data-no-pull.
const OWNS_TOUCH = "[aria-modal='true'], [role='dialog'], .ui-notif-sheet, .ui-drawer-overlay, .ui-drawer, .ui-fa-panel, .recharts-wrapper, .cm-editor, [data-no-pull]"

type Stage = "pull" | "refresh" | "home"

export interface PullDialProps {
  /** A short pull: re-fetch what is on screen. The dial turns until it settles. */
  onRefresh: () => Promise<unknown>
  /** A long pull goes here. Without it there is no Home stage (you are home). */
  onHome?: () => void
  enabled?: boolean
  /** False while a refresh would lose something: a short pull does nothing. */
  canRefresh?: boolean
  /** What slides down to uncover the band. The section swipe's element by default. */
  page?: string
  /** The band hangs from the bottom of this — the app's bar. */
  under?: string
  /** The Home stage's mark. */
  homeIcon?: ReactNode
}

/**
 * Family Hub's pull-down (its web/src/shell/PullDial.tsx), for the kit's
 * apps: at the very top of a page, a little pull refreshes it and a long one
 * goes home.
 *
 * The listeners are set up once and the page is moved by hand, 1:1 with the
 * finger and damped, with no React state per move. Family Hub's first version
 * re-rendered on every pixel and tore its listeners down and put them back
 * each time, so pulls lagged and a lift that landed between the two was lost.
 *
 * The page slides down and a band tucked behind it under the bar opens to the
 * same height, saying what letting go will do: a ring fills as you pull, then
 * goes solid with ↑ for Refresh, and turns with ⟳ while it runs; pulled on,
 * it shows the house for Home. Each
 * new stage pops, so you feel it change without looking for it.
 *
 * Only starts at the very top, never inside anything that owns the touch
 * (OWNS_TOUCH) or a box scrolled down inside the page, and never while a
 * section swipe or an open sheet has the page (body[data-swiping]).
 *
 *   <PullDial onRefresh={refetchVisible} onHome={atHome ? undefined : goHome} />
 */
export function PullDial({ onRefresh, onHome, enabled = true, canRefresh = true, page = "[data-swipe-content]", under = ".ui-nav", homeIcon }: PullDialProps) {
  const dial = useRef<HTMLDivElement>(null)
  // Read when a pull ends, so the listeners never need setting up again.
  const props = useRef({ onRefresh, onHome, enabled, canRefresh, page, under })
  props.current = { onRefresh, onHome, enabled, canRefresh, page, under }

  useEffect(() => {
    let startY: number | null = null
    let startX = 0
    let stage: Stage = "pull"
    let busy = false
    let nudge = 0
    let lastScroll = 0
    const onScroll = () => { lastScroll = Date.now() }

    const el = () => dial.current
    // The page slides down by y and the band behind it opens to exactly that
    // height, so it reads as uncovered rather than drawn on top.
    const show = (y: number, transition = "none") => {
      const d = el()
      const pageEl = document.querySelector<HTMLElement>(props.current.page)
      if (d) {
        d.style.transition = transition.replaceAll("transform", "height")
        d.style.height = `${y}px`
      }
      if (pageEl) {
        pageEl.style.transition = transition
        pageEl.style.transform = y > 0 ? `translateY(${y}px)` : ""
        // Over the band while it moves, so the band is only seen in the gap.
        pageEl.style.position = y > 0 ? "relative" : ""
        pageEl.style.zIndex = y > 0 ? "1" : ""
      }
    }
    const setStage = (next: Stage) => {
      const d = el()
      if (!d || next === stage) return
      stage = next
      d.dataset.stage = next
      if (!still() && next !== "pull") {
        d.classList.remove("is-pop")
        void d.offsetWidth
        d.classList.add("is-pop")
      }
    }
    // In the installed app iOS sometimes keeps drawing the pinned bars where
    // they were before the page moved under them, until the next scroll. A
    // scroll of a pixel and back, once the page is still, puts them right.
    const replaceFixed = () => {
      window.clearTimeout(nudge)
      nudge = window.setTimeout(function again() {
        if (Date.now() - lastScroll < 200) { nudge = window.setTimeout(again, 200); return }
        const x = window.scrollX, y = window.scrollY
        window.scrollTo(x, y + 1)
        requestAnimationFrame(() => window.scrollTo(x, y))
      }, 300)
    }
    const hide = () => {
      show(0, still() ? "none" : SETTLE)
      setStage("pull")
      el()?.style.setProperty("--p", "0")
      replaceFixed()
    }

    // A box that scrolls on its own and is not at its top: pulling down
    // there scrolls it back up, not the page.
    const scrolledInside = (from: Element | null) => {
      for (let n = from; n && n !== document.body; n = n.parentElement) {
        if (n.scrollTop > 0) return true
      }
      return false
    }

    const onStart = (event: TouchEvent) => {
      startY = null
      const p = props.current
      if (!p.enabled || busy || event.touches.length !== 1 || window.scrollY > 0) return
      if (document.body.dataset.swiping === "true") return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest(OWNS_TOUCH) || scrolledInside(target)) return
      startY = event.touches[0].clientY
      startX = event.touches[0].clientX
      // Hung from wherever the bar ends, whatever the notch makes it.
      const bar = document.querySelector(p.under)
      el()?.style.setProperty("--ui-pulldial-top", `${Math.max(0, Math.round(bar?.getBoundingClientRect().bottom ?? 0))}px`)
    }

    const onMove = (event: TouchEvent) => {
      if (startY === null) return
      if (window.scrollY > 0) { startY = null; hide(); return }
      const p = props.current
      const down = event.touches[0].clientY - startY
      const across = Math.abs(event.touches[0].clientX - startX)
      if (across > DEAD && across > down) { startY = null; hide(); return }
      const travelled = Math.max(0, down - DEAD)
      show(travelled * DAMP)
      el()?.style.setProperty("--p", String(Math.min(1, travelled / REFRESH)))
      setStage(p.onHome && travelled >= HOME ? "home" : travelled >= REFRESH && p.canRefresh ? "refresh" : "pull")
    }

    const onEnd = () => {
      if (startY === null) return
      startY = null
      const p = props.current
      if (stage === "home" && p.onHome) {
        hide()
        p.onHome()
        return
      }
      if (stage !== "refresh") { hide(); return }
      busy = true
      const d = el()
      d?.classList.add("is-working")
      show(PARK, still() ? "none" : SETTLE)
      p.onRefresh().catch(() => undefined).finally(() => {
        busy = false
        d?.classList.remove("is-working")
        hide()
      })
    }

    // Passive: this never stops the page's own scrolling or its rubber-band.
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("touchstart", onStart, { passive: true })
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onEnd, { passive: true })
    window.addEventListener("touchcancel", onEnd, { passive: true })
    return () => {
      window.clearTimeout(nudge)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("touchstart", onStart)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
      window.removeEventListener("touchcancel", onEnd)
    }
  }, [])

  // On <body>: inside the page it would slide down with it.
  if (typeof document === "undefined") return null
  return createPortal(
    <div ref={dial} className="ui-pulldial" data-stage="pull" aria-hidden="true">
      <span className="ui-pulldial-ring">
        <span className="ui-pulldial-face">
          <ArrowBigDown className="px-icon ui-pulldial-arrow" />
          <Reload className="px-icon ui-pulldial-working" />
          <span className="ui-pulldial-home">{homeIcon ?? <Home className="px-icon" />}</span>
        </span>
      </span>
    </div>,
    document.body,
  )
}
