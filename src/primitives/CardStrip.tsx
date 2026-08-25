import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  children: ReactNode[]
  className?: string
}

/**
 * Horizontal strip of cards — team pages' scrolling rows. Native touch
 * scrolling on phones; on desktop you can click-drag, and a drag suppresses
 * the trailing click so dragging never opens a card.
 */
export function CardStrip({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let down = false
    let startX = 0
    let startLeft = 0
    let moved = false

    const onDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return // touch/pen scroll natively
      if (e.button != null && e.button !== 0) return
      down = true
      moved = false
      startX = e.pageX
      startLeft = el.scrollLeft
      el.classList.add("ui-strip--dragging")
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.pageX - startX
      if (Math.abs(dx) > 3) moved = true
      el.scrollLeft = startLeft - dx
    }
    const onUp = () => {
      down = false
      el.classList.remove("ui-strip--dragging")
    }
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }

    el.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    el.addEventListener("click", onClickCapture, true)
    return () => {
      el.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      el.removeEventListener("click", onClickCapture, true)
    }
  }, [])

  return (
    <div ref={ref} className={cn("ui-strip", className)}>
      {children.map((child, i) => (
        <div key={i} className="ui-strip-cell">
          {child}
        </div>
      ))}
    </div>
  )
}
