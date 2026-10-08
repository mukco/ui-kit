import { useEffect, useRef, useState } from "react"
import { cn } from "../cn"

export interface SortOption {
  id: string
  label: string
}

interface Props {
  options: SortOption[]
  active: string
  onChange: (id: string) => void
  /** The word before the choice: "Sort". */
  label?: string
  className?: string
}

/**
 * One key that says how a list is ordered and opens the choices — in place of
 * a row of chips per option. Football's waiver wire had nine sort chips
 * wrapping onto two lines under the position chips (2026-10-08); this is one
 * line, and the list it opens is the app's own, themed, not the phone's.
 */
export function SortMenu({ options, active, onChange, label = "Sort", className }: Props) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.id === active) ?? options[0]

  useEffect(() => {
    if (!open) return undefined
    const away = (e: Event) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", away)
    document.addEventListener("touchstart", away)
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("mousedown", away)
      document.removeEventListener("touchstart", away)
      document.removeEventListener("keydown", key)
    }
  }, [open])

  return (
    <div ref={root} className={cn("ui-sortmenu", className)}>
      <button type="button" className="ui-sortmenu-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="ui-sortmenu-label">{label}</span>
        <span className="ui-sortmenu-value">{current?.label}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul className="ui-sortmenu-list" role="listbox" aria-label={label}>
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={o.id === active}
                className={cn("ui-sortmenu-opt", o.id === active && "is-on")}
                onClick={() => { onChange(o.id); setOpen(false) }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
