import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "../cn"

interface Props<T> {
  value: T | null
  onChange: (value: T | null) => void
  /** Search function; the kit debounces and calls it from 2 characters on. */
  fetcher: (query: string) => Promise<T[]>
  getLabel: (item: T) => string
  /** Optional extra line under each result. */
  getHint?: (item: T) => ReactNode
  /** Optional avatar/leading element per result. */
  renderLeading?: (item: T) => ReactNode
  placeholder?: string
  className?: string
}

/**
 * Generic search-and-pick combobox: debounced async results in a dropdown,
 * selected value shown as a chip with a clear button. Bring your own search
 * endpoint; the kit owns none.
 */
export function SearchSelect<T>({ value, onChange, fetcher, getLabel, getHint, renderLeading, placeholder = "Search…", className }: Props<T>) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setBusy(true)
    const t = setTimeout(() => {
      fetcher(query.trim())
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setBusy(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query, fetcher])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  if (value != null) {
    return (
      <div className={cn("ui-search-chip", className)}>
        {renderLeading?.(value)}
        <span className="ui-search-chip-label">{getLabel(value)}</span>
        {getHint && <span className="ui-search-hint">{getHint(value)}</span>}
        <button type="button" className="ui-search-clear" aria-label="Clear selection" onClick={() => onChange(null)}>
          ×
        </button>
      </div>
    )
  }

  return (
    <div ref={rootRef} className={cn("ui-search", className)}>
      <input
        className="ui-search-input"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && query.trim().length >= 2 && (
        <ul className="ui-search-results">
          {busy && <li className="ui-search-note">Searching…</li>}
          {!busy && results.length === 0 && <li className="ui-search-note">No matches.</li>}
          {!busy &&
            results.map((r, i) => (
              <li key={i}>
                <button type="button" className="ui-search-option" onClick={() => {
                  onChange(r)
                  setQuery("")
                  setOpen(false)
                }}>
                  {renderLeading?.(r)}
                  <span className="ui-search-option-label">{getLabel(r)}</span>
                  {getHint && <span className="ui-search-hint">{getHint(r)}</span>}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
