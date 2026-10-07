import { createElement, type ComponentType, type ReactNode, type SVGProps } from "react"
import {
  Calendar, ChartBarBig, Check, Cut, DiamondGem, Fire, HumanArmsUp, Lock, PartyPopper, Snowflake, Target, Trophy, WarningDiamond, Zap,
} from "pixelarticons/react"
import { useSkinTheme } from "./skinTheme"

/**
 * Phosphor draws icons the way Family Hub does: Pixelarticons, in the text
 * colour, never emoji or line icons. `pixel` draws the few the set lacks on
 * its grid; `Skin` swaps in a pixel icon under Phosphor and leaves light and
 * dark exactly as they were; `Glyph` does that for an app's own emoji marks.
 */
export type PixelIcon = ComponentType<SVGProps<SVGSVGElement>>

export const pixel = (d: string): PixelIcon => (props) =>
  createElement("svg", { viewBox: "0 0 24 24", width: 24, height: 24, fill: "currentColor", "aria-hidden": true, ...props }, createElement("path", { d }))

/** Pixelarticons' star is an outline: right for "not watched", wrong for "watched". */
export const StarFilled = pixel("M10 2h4v4h-4zM8 6h8v2h-8zM2 8h20v2h-20zM4 10h16v2h-16zM6 12h12v4h-12zM4 16h6v2h-6zM14 16h6v2h-6zM4 18h4v2h-4zM16 18h4v2h-4zM2 20h4v2h-4zM18 20h4v2h-4z")
export const Bandage = pixel("M14 2h4v2h-4zM12 4h2v2h-2zM18 4h2v2h-2zM10 6h2v2h-2zM20 6h2v4h-2zM8 8h2v2h-2zM14 8h2v2h-2zM18 10h2v2h-2zM6 10h2v2h-2zM12 10h2v2h-2zM16 12h2v2h-2zM4 12h2v2h-2zM10 12h2v2h-2zM2 14h2v4h-2zM14 14h2v2h-2zM12 16h2v2h-2zM4 18h2v2h-2zM10 18h2v2h-2zM6 20h4v2h-4z")

/** The pixel icon under Phosphor; whatever was there before otherwise. */
export function Skin({ px, children }: { px: ReactNode; children: ReactNode }) {
  const [theme] = useSkinTheme()
  return <>{theme === "phosphor" ? px : children}</>
}

// Emoji the apps use as marks, and the pixel icon each becomes under Phosphor.
// An emoji a person chose (a team icon, a note) is theirs and is never swapped.
const GLYPHS: Record<string, PixelIcon> = {
  "🏆": Trophy, "🥈": Trophy, "🔥": Fire, "🌶": Fire, "🧊": Snowflake, "❄": Snowflake, "❄️": Snowflake,
  "⚡": Zap, "🎯": Target, "💪": HumanArmsUp, "💎": DiamondGem, "🔒": Lock, "📅": Calendar, "📊": ChartBarBig,
  "🎉": PartyPopper, "✅": Check, "⚠": WarningDiamond, "✂": Cut, "★": StarFilled,
}

/** Add an app's own marks (its ball, say) to the emoji Glyph knows. */
export function registerGlyphs(more: Record<string, PixelIcon>) {
  Object.assign(GLYPHS, more)
}

/** An app emoji: itself in light and dark, its pixel icon under Phosphor. */
export function Glyph({ e, className }: { e: string; className?: string }) {
  const [theme] = useSkinTheme()
  const Px = GLYPHS[e]
  return theme === "phosphor" && Px ? <Px className={`px-icon${className ? ` ${className}` : ""}`} /> : <>{e}</>
}
