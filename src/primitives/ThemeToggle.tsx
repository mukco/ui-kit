import { useCallback, useEffect, useState } from "react"
import { cn } from "../cn"

export type ThemeChoice = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

const DEFAULT_KEY = "ui-theme"
const DARK_QUERY = "(prefers-color-scheme: dark)"

function readStored(key: string): ThemeChoice {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === "light" || raw === "dark" || raw === "system") return raw
  } catch {
    // Private windows and blocked site data throw on access, not just on write.
  }
  return "system"
}

function systemPrefers(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light"
}

/**
 * Owns the theme for a whole app: remembers the choice, follows the system
 * when asked to, and writes `data-theme` onto <html>.
 *
 * "system" is resolved here in JS rather than left to CSS on purpose. The dark
 * tokens hang off `[data-theme='dark']` and there is no prefers-color-scheme
 * fallback anywhere in the kit, so *removing* the attribute means light — not
 * "whatever the machine wants". The attribute is therefore always written.
 *
 * Call this once, near the root. `ThemeToggle` calls it for you.
 */
export function useTheme(storageKey: string = DEFAULT_KEY) {
  const [theme, setChoice] = useState<ThemeChoice>(() =>
    typeof window === "undefined" ? "system" : readStored(storageKey),
  )
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(systemPrefers)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => setSystemTheme(media.matches ? "dark" : "light")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const resolved: ResolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved)
  }, [resolved])

  const setTheme = useCallback(
    (next: ThemeChoice) => {
      setChoice(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Nothing to do about it — the choice still applies to this page.
      }
    },
    [storageKey],
  )

  return { theme, resolved, setTheme }
}

const OPTIONS: ReadonlyArray<{ id: ThemeChoice; label: string; icon: string }> = [
  { id: "light", label: "Light", icon: "☀" },
  { id: "system", label: "Auto", icon: "◐" },
  { id: "dark", label: "Dark", icon: "☾" },
]

interface Props {
  /** Where the choice is remembered. Give each app its own key only if two
      apps share an origin and should disagree. */
  storageKey?: string
  /** Icons only — for a cramped top bar. The words stay as labels. */
  compact?: boolean
  /** Told after the change is applied; the toggle still owns the state. */
  onChange?: (theme: ThemeChoice) => void
  className?: string
}

/**
 * Light / Auto / Dark, as a segmented control.
 *
 * Three buttons rather than one that cycles: with three states a cycling
 * button cannot say what the next press will do, and "Auto" is invisible in a
 * two-state switch even though it is the right default.
 *
 * Self-contained — it calls useTheme() itself, so dropping it into a nav is
 * the whole integration. An app that wants the value elsewhere calls
 * useTheme() with the same storageKey.
 */
export function ThemeToggle({ storageKey, compact, onChange, className }: Props) {
  const { theme, setTheme } = useTheme(storageKey)

  return (
    <div
      className={cn("ui-theme", compact && "ui-theme--compact", className)}
      role="radiogroup"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={theme === option.id}
          aria-label={option.label}
          title={option.label}
          className={cn("ui-theme-opt", theme === option.id && "is-on")}
          onClick={() => {
            setTheme(option.id)
            onChange?.(option.id)
          }}
        >
          <span aria-hidden="true">{option.icon}</span>
          {!compact && <span className="ui-theme-label">{option.label}</span>}
        </button>
      ))}
    </div>
  )
}
