import { useRef, useState } from "react"

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface Props {
  date: string
  onChange: (isoDate: string) => void
  /** Cap at today — for sources with no future data. */
  disableFuture?: boolean
}

// ‹ prev · date label + native picker + "back to today" · next ›
export function DateNav({ date, onChange, disableFuture = false }: Props) {
  const [todayStr] = useState(() => fmt(new Date()))
  const isToday = date === todayStr
  const atMax = disableFuture && isToday

  const pickerRef = useRef<HTMLInputElement>(null)

  // Clicking a date input's *text* does not open the calendar in Chrome —
  // only its native indicator does, and ours is transparent. So an invisible
  // input laid over the date looked tappable and did nothing. showPicker() is
  // the supported way to open it from our own control; the input stays in the
  // DOM, unclickable, purely as the thing the popup anchors to.
  const openPicker = () => {
    const el = pickerRef.current
    if (!el) return
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker()
        return
      } catch {
        // showPicker() throws if it is not from a user gesture, or on browsers
        // that expose it but refuse for this input type. Fall through.
      }
    }
    el.focus()
    el.click()
  }

  const shift = (days: number) => {
    const d = new Date(`${date}T12:00:00`)
    d.setDate(d.getDate() + days)
    onChange(fmt(d))
  }

  return (
    <div className="ui-datenav">
      <button type="button" onClick={() => shift(-1)} className="ui-datenav-btn" aria-label="Previous day">
        ‹
      </button>
      <div className="ui-datenav-mid">
        {/* The picker is an invisible overlay on the date rather than a second
            control printing the same value underneath it. It is scoped to this
            line and not to the whole column: stretched over the column it also
            covered the "back to today" button, so tapping Today opened the
            calendar instead. The glyph is the affordance — an invisible input
            with nothing to point at reads as a missing calendar. */}
        <span className="ui-datenav-dateline">
          <button type="button" onClick={openPicker} className="ui-datenav-datebtn" aria-label="Choose date">
            <span className="ui-datenav-date">
              {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <svg className="ui-datenav-cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
            </svg>
          </button>
          <input
            ref={pickerRef}
            type="date"
            value={date}
            max={disableFuture ? todayStr : undefined}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="ui-datenav-picker"
            tabIndex={-1}
            aria-hidden="true"
          />
        </span>
        {!isToday && (
          <button type="button" onClick={() => onChange(todayStr)} className="ui-datenav-today">
            ⟲ Today
          </button>
        )}
      </div>
      <button type="button" onClick={() => shift(1)} disabled={atMax} className="ui-datenav-btn ui-datenav-btn--next" style={{ opacity: atMax ? 0.3 : undefined }} aria-label="Next day">
        ›
      </button>
    </div>
  )
}
