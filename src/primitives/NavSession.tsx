import { Logout, SettingsCog, Sun } from "pixelarticons/react"
import { IconButton } from "./IconButton"
import { IconCrt, IconMoon, IconSettings, IconSignOut } from "./Icon"
import { nextSkinTheme, useSkinTheme } from "./skinTheme"

/**
 * The navbar's account controls — Settings, Sign out, and the look button
 * that steps light → dark → Phosphor — as icon buttons on desktop and as
 * labelled rows in the phone drawer. Pass them to NavBar's `right` and
 * `drawerFooter`. Pixel icons under Phosphor, line icons otherwise.
 */
interface Props {
  email?: string | null
  onSettings: () => void
  onSignOut: () => void
}

function useControls() {
  const [theme, setTheme] = useSkinTheme()
  const px = theme === "phosphor"
  const nextLabel = theme === "light" ? "Dark mode" : theme === "dark" ? "Phosphor" : "Light mode"
  // The icon shows where the button goes next.
  const themeIcon = theme === "light" ? <IconMoon /> : theme === "dark" ? <IconCrt /> : <Sun className="ui-navsession-px" />
  return {
    settings: px ? <SettingsCog className="ui-navsession-px" /> : <IconSettings />,
    signOut: px ? <Logout className="ui-navsession-px" /> : <IconSignOut />,
    themeIcon, nextLabel,
    toggle: () => setTheme(nextSkinTheme(theme)),
  }
}

export function NavSessionButtons({ email, onSettings, onSignOut }: Props) {
  const c = useControls()
  return (
    <>
      <span className="ui-navsession">
        <IconButton label="Settings" onClick={onSettings}>{c.settings}</IconButton>
      </span>
      <span className="ui-navsession">
        <IconButton label={email ? `Sign out (${email})` : "Sign out"} onClick={onSignOut}>{c.signOut}</IconButton>
      </span>
      <span className="ui-navsession">
        <IconButton label={`Switch to ${c.nextLabel}`} onClick={c.toggle}>{c.themeIcon}</IconButton>
      </span>
    </>
  )
}

export function NavSessionDrawer({ onSettings, onSignOut }: Props) {
  const c = useControls()
  return (
    <>
      <button type="button" className="ui-nav-mobile-link" onClick={onSettings}>{c.settings} Settings</button>
      <button type="button" className="ui-nav-mobile-link" onClick={onSignOut}>{c.signOut} Sign out</button>
      <button type="button" className="ui-nav-mobile-link" onClick={c.toggle}>{c.themeIcon} {c.nextLabel}</button>
    </>
  )
}
