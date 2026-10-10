import type { ReactNode } from "react"
import { ChevronRight } from "pixelarticons/react"
import { cn } from "../cn"

export interface SettingsNavItem {
  key: string
  label: ReactNode
  /** The section's icon, in a framed tile. */
  icon?: ReactNode
  /** What it is set to now ("Daylight", "What reaches this device"). */
  summary?: ReactNode
  onSelect: () => void
  /** The › at the right; off for a row that acts rather than opens (Sign out). */
  chevron?: boolean
  className?: string
}

/**
 * Settings as a list of sections, each its own page — Family Hub's Control
 * Panel (2026-10-02). It was one long scroll of cards and the family
 * scrolled past the thing they wanted. Each row says what it is and what it
 * is set to now; tapping opens it (the app pushes the page, so the phone's
 * Back closes it). A last row can act instead (Sign out): chevron false.
 */
export function SettingsNav({ items, label = "Settings", chevronIcon, className }: {
  items: SettingsNavItem[]
  /** The nav's accessible name. */
  label?: string
  /** The › (default Pixelarticons' ChevronRight). */
  chevronIcon?: ReactNode
  className?: string
}) {
  return (
    <nav className={cn("ui-setnav", className)} aria-label={label}>
      {items.map((item) => (
        <button key={item.key} type="button" className={cn("ui-setnav-row", item.className)} onClick={item.onSelect}>
          <span className="ui-setnav-icon">{item.icon}</span>
          <span className="ui-setnav-words">
            <span className="ui-setnav-name">{item.label}</span>
            {item.summary != null && <span className="ui-setnav-now">{item.summary}</span>}
          </span>
          {item.chevron !== false && (chevronIcon ?? <ChevronRight className="px-icon ui-setnav-go" aria-hidden="true" />)}
        </button>
      ))}
    </nav>
  )
}
