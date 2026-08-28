import { useState } from "react"

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
          <span className="ui-datenav-date">
            {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <svg className="ui-datenav-cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          <input
            type="date"
            value={date}
            max={disableFuture ? todayStr : undefined}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="ui-datenav-picker"
            aria-label="Choose date"
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
