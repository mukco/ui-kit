import { useSyncExternalStore } from "react"

/**
 * The app's look: light, dark, or Phosphor — Family Hub's amber CRT. Phosphor
 * is dark with a skin on top: data-theme="dark" keeps every dark-mode rule,
 * data-skin="phosphor" adds the amber, the pixel type and the windows
 * (ui-kit/phosphor.css). One store for the whole page, configured once at boot:
 *
 *   configureSkinTheme({ storageKey: "football-theme", metaColors: { light, dark, phosphor } })
 *
 * The app's index.html applies the saved choice before first paint (see
 * PHOSPHOR_FONTS_HREF for the fonts link it writes); this keeps it and the
 * page in step afterwards. Separate from useTheme/ThemeToggle, which know
 * light/dark/system only.
 */
export type SkinTheme = "light" | "dark" | "phosphor"

export const SKIN_THEMES: { id: SkinTheme; label: string }[] = [
  { id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "phosphor", label: "Phosphor" },
]

/** Family Hub's faces, fetched only when somebody picks Phosphor. */
export const PHOSPHOR_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400;600;700&family=VT323&display=swap"

export interface SkinThemeOptions {
  /** localStorage key the choice is kept under (and index.html reads). */
  storageKey: string
  /** <meta name="theme-color"> per look (the browser chrome around the app). */
  metaColors: { light: string; dark: string; phosphor: string }
}

let options: SkinThemeOptions | null = null
const listeners = new Set<() => void>()

function read(): SkinTheme {
  if (typeof document === "undefined") return "light"
  const root = document.documentElement
  if (root.dataset.skin === "phosphor") return "phosphor"
  return root.dataset.theme === "dark" ? "dark" : "light"
}

let current: SkinTheme = read()

export function configureSkinTheme(next: SkinThemeOptions) {
  options = next
  current = read()
}

export function applySkinTheme(theme: SkinTheme) {
  const root = document.documentElement
  root.dataset.theme = theme === "light" ? "light" : "dark"
  if (theme === "phosphor") {
    root.dataset.skin = "phosphor"
    if (!document.getElementById("phosphor-fonts")) {
      const link = document.createElement("link")
      link.id = "phosphor-fonts"
      link.rel = "stylesheet"
      link.href = PHOSPHOR_FONTS_HREF
      document.head.appendChild(link)
    }
  } else {
    delete root.dataset.skin
  }
  const colors = options?.metaColors
  if (colors) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors[theme])
  }
}

export function setSkinTheme(theme: SkinTheme) {
  current = theme
  applySkinTheme(theme)
  try { if (options) window.localStorage.setItem(options.storageKey, theme) } catch { /* private mode */ }
  listeners.forEach((l) => l())
}

/** The look after this one, for a single cycling button. */
export function nextSkinTheme(theme: SkinTheme): SkinTheme {
  const i = SKIN_THEMES.findIndex((t) => t.id === theme)
  return SKIN_THEMES[(i + 1) % SKIN_THEMES.length].id
}

export function useSkinTheme(): [SkinTheme, (t: SkinTheme) => void] {
  const theme = useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l) } },
    () => current,
    () => "light" as SkinTheme,
  )
  return [theme, setSkinTheme]
}
