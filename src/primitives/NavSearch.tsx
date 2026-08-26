import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react"
import { cn } from "../cn"
import { IconSearch } from "./Icon"

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Announced to assistive tech, since a search field in a nav bar rarely has
      a visible label. */
  label?: string
  /** Shown while results are being fetched. */
  busy?: boolean
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  /**
   * Binds ⌘K / Ctrl-K to focus this field, and shows the hint. Off by default:
   * two fields on one page both claiming the shortcut is worse than neither
   * having it.
   */
  shortcut?: boolean
  className?: string
}

/**
 * The search field in a nav bar — baseball's, extracted.
 *
 * The icon lives *inside* the field rather than beside it. That is the whole
 * difference between "a text input, and separately a magnifier" and "a search
 * box": the affordance is the box, and a glyph parked next to it reads as
 * another button in the row of buttons.
 *
 * The ⌘K hint is a `kbd`, hidden on narrow screens where there is no keyboard
 * to press it with and no room to say so.
 */
export function NavSearch({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  busy,
  onKeyDown,
  shortcut,
  className,
}: Props) {
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!shortcut) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        input.current?.focus()
        input.current?.select()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [shortcut])

  return (
    <div className={cn("ui-navsearch", className)}>
      <IconSearch className="ui-navsearch-icon" />
      <input
        ref={input}
        type="search"
        className="ui-navsearch-input"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {busy && <span className="ui-navsearch-busy ui-spinner" aria-hidden="true" />}
      {shortcut && (
        <kbd className="ui-navsearch-kbd" aria-hidden="true">
          ⌘K
        </kbd>
      )}
    </div>
  )
}
