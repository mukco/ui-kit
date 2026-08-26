import { useEffect, useId, useRef, useState, type ReactNode } from "react"
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
  /**
   * Renders the whole option row, replacing label + hint.
   *
   * A label and one line of hint is right for picking a person and wrong for
   * picking a model, where the choice is made on several facts at once — what
   * it is, who makes it, what it costs in and what it costs out. Squeezing
   * that into one hint line produces the thing it replaced: a sentence you
   * have to read instead of a row you can scan.
   *
   * getLabel is still required and still used for the chip once something is
   * chosen, so a custom row cannot leave the selected state unnamed.
   */
  renderOption?: (item: T) => ReactNode
  placeholder?: string
  /**
   * How much has to be typed before the list appears. 2 by default, which is
   * right when the fetcher is a network search and wrong when it is a filter
   * over a list already in memory: there, requiring two characters means you
   * cannot see what the options *are* without guessing at one.
   *
   * Pass 0 for a browsable list — focusing the field then shows everything.
   */
  minChars?: number
  className?: string
}

/**
 * Generic search-and-pick combobox: debounced async results in a dropdown,
 * selected value shown as a chip with a clear button. Bring your own search
 * endpoint; the kit owns none.
 *
 * It was called a combobox and was not one. No role, no aria-expanded, no
 * arrow keys, no Escape, no Enter — and the options were buttons, so Tab
 * walked through every result one at a time. A screen reader user got a bare
 * text field that silently grew a list they were never told about; a keyboard
 * user got a list they could only leave by tabbing through all of it.
 *
 * The real pattern: the input keeps focus throughout and aria-activedescendant
 * points at the highlighted option. That is why the options are divs rather
 * than buttons — focus must never leave the input, or typing stops working
 * half way through choosing.
 */
export function SearchSelect<T>({ value, onChange, fetcher, getLabel, getHint, renderLeading, renderOption, placeholder = "Search…", minChars = 2, className }: Props<T>) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<T[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  // -1 is "nothing highlighted", which is the honest state before the reader
  // has arrowed: pre-selecting the first result means Enter picks something
  // nobody chose.
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (query.trim().length < minChars) {
      // With minChars 0 an empty query is a real query — "show me everything" —
      // so it goes to the fetcher rather than being short-circuited to nothing.
      if (minChars > 0) {
        setResults([])
        return
      }
    }
    setBusy(true)
    const t = setTimeout(() => {
      fetcher(query.trim())
        .then((rows) => {
          setResults(rows)
          // A new result set invalidates the old highlight — index 3 of the
          // previous search is not index 3 of this one.
          setActive(-1)
        })
        .catch(() => setResults([]))
        .finally(() => setBusy(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query, fetcher, minChars])

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

  const listOpen = open && query.trim().length >= minChars

  function choose(item: T) {
    onChange(item)
    setQuery("")
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      // Closes the list, keeps what was typed. Clearing the query too would
      // throw away work on a key people press to mean "not that".
      setOpen(false)
      setActive(-1)
      return
    }
    if (!listOpen || busy || results.length === 0) return

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const step = event.key === "ArrowDown" ? 1 : -1
      setActive((was) => {
        const next = was + step
        if (next < 0) return results.length - 1
        if (next >= results.length) return 0
        return next
      })
      return
    }

    if (event.key === "Enter" && active >= 0) {
      // Only when something is highlighted, so Enter in a form with nothing
      // chosen still submits the form rather than being quietly eaten.
      event.preventDefault()
      choose(results[active])
    }
  }

  return (
    <div ref={rootRef} className={cn("ui-search", className)}>
      <input
        className="ui-search-input"
        value={query}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        // Points at the highlighted option while focus stays here. This is the
        // whole reason the options are not buttons.
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {listOpen && (
        <ul className="ui-search-results" id={listId} role="listbox">
          {busy && (
            <li className="ui-search-note" role="status">
              Searching…
            </li>
          )}
          {!busy && results.length === 0 && (
            <li className="ui-search-note" role="status">
              No matches.
            </li>
          )}
          {!busy &&
            results.map((r, i) => (
              <li
                key={i}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={cn("ui-search-option", i === active && "is-active")}
                // Mouse and keyboard end up in the same place; the pointer
                // moves the highlight so the two never disagree about which
                // row Enter would take.
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(r)}
              >
                {renderOption ? (
                  renderOption(r)
                ) : (
                  <>
                    {renderLeading?.(r)}
                    <span className="ui-search-option-label">{getLabel(r)}</span>
                    {getHint && <span className="ui-search-hint">{getHint(r)}</span>}
                  </>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
