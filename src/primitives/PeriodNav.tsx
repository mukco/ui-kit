interface Period {
  id: string
  label: string
}

interface Props {
  periods: Period[]
  /** The id of the period shown. */
  value: string
  onChange: (id: string) => void
  /** The period "now" lives in; when another is shown, a button goes back to it. */
  current?: string
  /** The back-to-now button's word: "This week". */
  currentLabel?: string
  /** What a period is called, for the arrows' labels: "week". */
  noun?: string
}

/**
 * DateNav for a schedule that steps by something other than a day — a
 * league's weeks, a tournament's rounds. ‹ prev · label (a picker over it) · next ›,
 * drawn with DateNav's own classes so the two read as one control.
 *
 * The picker is an invisible <select> laid over the label: unlike a date
 * input, a select opens on a click to itself, so it takes the tap directly.
 */
export function PeriodNav({ periods, value, onChange, current, currentLabel = "Now", noun = "period" }: Props) {
  const idx = periods.findIndex((p) => p.id === value)
  const prev = idx > 0 ? periods[idx - 1] : null
  const next = idx >= 0 && idx < periods.length - 1 ? periods[idx + 1] : null
  const away = current != null && current !== value && periods.some((p) => p.id === current)

  return (
    <div className="ui-datenav">
      <button type="button" onClick={() => prev && onChange(prev.id)} disabled={!prev} className="ui-datenav-btn" aria-label={`Previous ${noun}`}>
        ‹
      </button>
      <div className="ui-datenav-mid">
        <span className="ui-datenav-dateline">
          <span className="ui-datenav-date">{periods[idx]?.label ?? "—"}</span>
          <svg className="ui-datenav-cal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <select
            value={idx >= 0 ? periods[idx].id : ""}
            onChange={(e) => onChange(e.target.value)}
            className="ui-periodnav-picker"
            aria-label={`Choose ${noun}`}
          >
            {periods.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </span>
        {away && (
          <button type="button" onClick={() => onChange(current!)} className="ui-datenav-today">
            ⟲ {currentLabel}
          </button>
        )}
      </div>
      <button type="button" onClick={() => next && onChange(next.id)} disabled={!next} className="ui-datenav-btn ui-datenav-btn--next" aria-label={`Next ${noun}`}>
        ›
      </button>
    </div>
  )
}
