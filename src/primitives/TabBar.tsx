import type { PixelIcon } from "./Pixel"

/**
 * Family Hub's phone tab bar, for the Phosphor skin: the app's places along
 * the foot of the screen, five and a half to a row so the half says it
 * scrolls. Always rendered; ui-kit/phosphor.css shows it only under Phosphor
 * at phone width. The app owns routing: pass the current path and a navigate.
 */
export interface TabBarTab {
  to: string
  label: string
  Icon: PixelIcon
  /** Path prefixes that light this tab ("/" matches only the root). */
  match: string[]
}

export interface TabBarProps {
  tabs: TabBarTab[]
  pathname: string
  onNavigate: (to: string) => void
  label?: string
}

export function TabBar({ tabs, pathname, onNavigate, label = "Sections" }: TabBarProps) {
  const here = (t: TabBarTab) => t.match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)))
  return (
    <nav className="ph-tabbar" aria-label={label}>
      <div className="ph-tabbar-track">
        {tabs.map((t) => (
          <button key={t.to} type="button" className={`ph-tab${here(t) ? " ph-tab--here" : ""}`} aria-current={here(t) ? "page" : undefined} onClick={() => onNavigate(t.to)}>
            <t.Icon className="ph-tab-icon" aria-hidden="true" /><span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
