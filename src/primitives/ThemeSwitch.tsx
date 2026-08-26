import { IconButton } from "./IconButton"
import { IconMoon, IconSun } from "./Icon"
import { useTheme } from "./ThemeToggle"

interface Props {
  storageKey?: string
  className?: string
}

/**
 * One button that flips between light and dark — baseball's light switch,
 * extracted.
 *
 * The kit already had ThemeToggle, a three-option segmented control with an
 * Auto in the middle. Both are right in different places: the segmented one
 * belongs on a settings screen, where "follow the system" is a real choice
 * worth showing; this one belongs in a nav bar, where a three-option control
 * takes the width of three controls to do the job of one.
 *
 * It shows the icon of the state it will move to, which is the convention and
 * the opposite of what "show the current state" would suggest — a sun in dark
 * mode means "press for light", and every OS does it this way.
 *
 * Shares useTheme with ThemeToggle, so a settings screen and a nav bar in the
 * same app cannot disagree about what theme is on.
 */
export function ThemeSwitch({ storageKey, className }: Props) {
  const { resolved, setTheme } = useTheme(storageKey)
  const goingTo = resolved === "dark" ? "light" : "dark"

  return (
    <IconButton
      label={goingTo === "dark" ? "Switch to dark mode" : "Switch to light mode"}
      className={className}
      onClick={() => setTheme(goingTo)}
    >
      {resolved === "dark" ? <IconSun /> : <IconMoon />}
    </IconButton>
  )
}
