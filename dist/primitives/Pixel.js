import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { createElement } from "react";
import { Calendar, ChartBarBig, Check, Cut, DiamondGem, Fire, HumanArmsUp, Lock, PartyPopper, Snowflake, Target, Trophy, WarningDiamond, Zap, } from "pixelarticons/react";
import { useSkinTheme } from "./skinTheme";
/**
 * One icon from a path on Pixelarticons' 24×24 grid, in the text colour.
 * Decorative by default (`aria-hidden`), unless it is given a name
 * (`aria-label` / `aria-labelledby`): a labelled icon is the thing a screen
 * reader should hear, as Family Hub's "Liked" heart is. Typed as Pixelarticons'
 * own components are, so the two mix in one list.
 */
export const pixel = (d) => (props) => createElement("svg", {
    viewBox: "0 0 24 24", width: 24, height: 24, fill: "currentColor",
    "aria-hidden": props["aria-label"] || props["aria-labelledby"] ? undefined : true,
    ...props,
}, createElement("path", { d }));
/** Pixelarticons' star is an outline: right for "not watched", wrong for "watched". */
export const StarFilled = pixel("M10 2h4v4h-4zM8 6h8v2h-8zM2 8h20v2h-20zM4 10h16v2h-16zM6 12h12v4h-12zM4 16h6v2h-6zM14 16h6v2h-6zM4 18h4v2h-4zM16 18h4v2h-4zM2 20h4v2h-4zM18 20h4v2h-4z");
export const Bandage = pixel("M14 2h4v2h-4zM12 4h2v2h-2zM18 4h2v2h-2zM10 6h2v2h-2zM20 6h2v4h-2zM8 8h2v2h-2zM14 8h2v2h-2zM18 10h2v2h-2zM6 10h2v2h-2zM12 10h2v2h-2zM16 12h2v2h-2zM4 12h2v2h-2zM10 12h2v2h-2zM2 14h2v4h-2zM14 14h2v2h-2zM12 16h2v2h-2zM4 18h2v2h-2zM10 18h2v2h-2zM6 20h4v2h-4z");
/* ---- Family Hub's own drawings (family-hub web/src/shell/pixelIcons.tsx,
   moved here 2026-10-09 when the hub became a consumer). Same grid, same
   rule: one path in the text colour, so they sit among Pixelarticons' icons
   without looking borrowed. */
export const Remote = pixel("M8 2h8v2h-8zM6 4h2v2h-2zM16 4h2v2h-2zM6 6h2v2h-2zM10 6h4v2h-4zM16 6h2v2h-2zM6 8h2v2h-2zM10 8h4v2h-4zM16 8h2v2h-2zM6 10h2v2h-2zM16 10h2v2h-2zM6 12h2v2h-2zM16 12h2v2h-2zM6 14h2v2h-2zM10 14h4v2h-4zM16 14h2v2h-2zM6 16h2v2h-2zM16 16h2v2h-2zM6 18h2v2h-2zM10 18h4v2h-4zM16 18h2v2h-2zM8 20h8v2h-8z");
export const Pot = pixel("M4 4h2v2h-2zM10 4h2v2h-2zM16 4h2v2h-2zM6 6h2v2h-2zM12 6h2v2h-2zM18 6h2v2h-2zM2 10h20v2h-20zM4 12h2v2h-2zM18 12h2v2h-2zM4 14h2v2h-2zM18 14h2v2h-2zM4 16h2v2h-2zM18 16h2v2h-2zM4 18h2v2h-2zM18 18h2v2h-2zM6 20h12v2h-12z");
export const SkipNext = pixel("M4 4h2v2h-2zM14 4h6v2h-6zM4 6h4v2h-4zM14 6h2v2h-2zM18 6h2v2h-2zM4 8h2v2h-2zM8 8h2v2h-2zM14 8h2v2h-2zM18 8h2v2h-2zM4 10h2v2h-2zM10 10h2v2h-2zM14 10h2v2h-2zM18 10h2v2h-2zM4 12h2v2h-2zM10 12h2v2h-2zM14 12h2v2h-2zM18 12h2v2h-2zM4 14h2v2h-2zM8 14h2v2h-2zM14 14h2v2h-2zM18 14h2v2h-2zM4 16h4v2h-4zM14 16h2v2h-2zM18 16h2v2h-2zM4 18h2v2h-2zM14 18h6v2h-6z");
export const SkipPrevious = pixel("M18 4h2v2h-2zM4 4h6v2h-6zM16 6h4v2h-4zM8 6h2v2h-2zM4 6h2v2h-2zM18 8h2v2h-2zM14 8h2v2h-2zM8 8h2v2h-2zM4 8h2v2h-2zM18 10h2v2h-2zM12 10h2v2h-2zM8 10h2v2h-2zM4 10h2v2h-2zM18 12h2v2h-2zM12 12h2v2h-2zM8 12h2v2h-2zM4 12h2v2h-2zM18 14h2v2h-2zM14 14h2v2h-2zM8 14h2v2h-2zM4 14h2v2h-2zM16 16h4v2h-4zM8 16h2v2h-2zM4 16h2v2h-2zM18 18h2v2h-2zM4 18h6v2h-6z");
/* The emoji the hub still used as buttons and badges, redrawn on the same grid
   (2026-10-02): a sunrise for the morning chores, a takeout box and a frying
   pan for dinner, a playing card for the deal, and the chores plant in four
   stages — sprout, sapling, tree, flower — as the week fills up. */
export const Sunrise = pixel("M10 2h4v2h-4zM4 4h2v2h-2zM18 4h2v2h-2zM6 6h2v2h-2zM10 6h4v2h-4zM16 6h2v2h-2zM8 8h8v2h-8zM6 10h12v2h-12zM2 12h2v2h-2zM6 12h12v2h-12zM20 12h2v2h-2zM2 14h20v2h-20zM6 18h12v2h-12zM10 20h4v2h-4z");
export const PlantSprout = pixel("M4 8h4v2h-4zM16 8h4v2h-4zM2 10h6v2h-6zM16 10h6v2h-6zM4 12h6v2h-6zM14 12h6v2h-6zM8 14h8v2h-8zM10 16h4v2h-4zM10 18h4v2h-4zM6 20h12v2h-12z");
export const PlantSapling = pixel("M12 2h4v2h-4zM10 4h8v2h-8zM4 6h4v2h-4zM12 6h4v2h-4zM2 8h8v2h-8zM12 8h2v2h-2zM4 10h6v2h-6zM12 10h2v2h-2zM10 12h4v2h-4zM16 12h4v2h-4zM10 14h10v2h-10zM10 16h4v2h-4zM10 18h4v2h-4zM6 20h12v2h-12z");
export const PlantTree = pixel("M8 2h8v2h-8zM4 4h16v2h-16zM2 6h20v2h-20zM2 8h20v2h-20zM2 10h20v2h-20zM4 12h16v2h-16zM8 14h8v2h-8zM10 16h4v2h-4zM10 18h4v2h-4zM6 20h12v2h-12z");
export const PlantFlower = pixel("M10 2h4v2h-4zM6 4h4v2h-4zM14 4h4v2h-4zM6 6h2v2h-2zM10 6h4v2h-4zM16 6h2v2h-2zM6 8h4v2h-4zM14 8h4v2h-4zM10 10h4v2h-4zM10 12h4v2h-4zM4 14h4v2h-4zM10 14h4v2h-4zM16 14h4v2h-4zM6 16h12v2h-12zM10 18h4v2h-4zM6 20h12v2h-12z");
export const Takeout = pixel("M6 2h2v2h-2zM16 2h2v2h-2zM8 4h2v2h-2zM14 4h2v2h-2zM10 6h4v2h-4zM2 8h20v2h-20zM2 10h2v2h-2zM20 10h2v2h-2zM4 12h2v2h-2zM18 12h2v2h-2zM4 14h2v2h-2zM18 14h2v2h-2zM4 16h2v2h-2zM18 16h2v2h-2zM4 18h2v2h-2zM18 18h2v2h-2zM6 20h12v2h-12z");
export const Pan = pixel("M6 6h4v2h-4zM4 8h8v2h-8zM2 10h20v2h-20zM2 12h2v2h-2zM16 12h2v2h-2zM2 14h2v2h-2zM16 14h2v2h-2zM4 16h2v2h-2zM14 16h2v2h-2zM6 18h8v2h-8z");
export const PlayingCard = pixel("M4 2h16v2h-16zM4 4h2v2h-2zM18 4h2v2h-2zM4 6h2v2h-2zM8 6h2v2h-2zM18 6h2v2h-2zM4 8h2v2h-2zM18 8h2v2h-2zM4 10h2v2h-2zM10 10h4v2h-4zM18 10h2v2h-2zM4 12h2v2h-2zM8 12h8v2h-8zM18 12h2v2h-2zM4 14h2v2h-2zM10 14h4v2h-4zM18 14h2v2h-2zM4 16h2v2h-2zM18 16h2v2h-2zM4 18h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2zM4 20h16v2h-16z");
// ♥ for a liked song: Pixelarticons' heart is an outline only, and the ♥
// character is a red emoji on a phone. The same heart, filled (2026-10-02).
export const HeartFilled = pixel("M5 2h4v2h-4zM15 2h4v2h-4zM3 4h8v2h-8zM13 4h8v2h-8zM1 6h22v6h-22zM3 12h18v2h-18zM5 14h14v2h-14zM7 16h10v2h-10zM9 18h6v2h-6zM11 20h2v2h-2z");
// Back and ahead by some seconds: a turn of an arrow either way, for the
// skip keys — "↺15" and "30↻" in the pixel font read as "J15" and "30C"
// (2026-10-02). The number goes beside it, in the key's own words.
export const TurnBack = pixel("M10 2h2v2h-2zM8 4h4v2h-4zM6 6h12v2h-12zM8 8h4v2h-4zM18 8h2v2h-2zM10 10h2v2h-2zM20 10h2v8h-2zM4 12h2v6h-2zM6 18h2v2h-2zM18 18h2v2h-2zM8 20h10v2h-10z");
export const TurnAhead = pixel("M12 2h2v2h-2zM12 4h4v2h-4zM6 6h12v2h-12zM12 8h4v2h-4zM4 8h2v2h-2zM12 10h2v2h-2zM2 10h2v8h-2zM18 12h2v6h-2zM4 18h2v2h-2zM16 18h2v2h-2zM6 20h10v2h-10z");
// ✓ for "asked for": Pixelarticons' check is one pixel thick on a diagonal,
// so beside the info box and the plus on a card's foot it read faint and
// small. The same tick, two pixels thick, so the keys weigh the same
// (2026-10-02).
export const CheckBold = pixel("M4 12h2v4h-2zM6 14h2v4h-2zM8 16h2v4h-2zM10 14h2v4h-2zM12 12h2v4h-2zM14 10h2v4h-2zM16 8h2v4h-2zM18 6h2v4h-2z");
// ✓✓ for "already here", thickened the same way.
export const CheckDoubleBold = pixel("M1 12h2v4h-2zM3 14h2v4h-2zM5 16h2v4h-2zM7 14h2v4h-2zM9 12h2v4h-2zM11 10h2v4h-2zM13 8h2v4h-2zM15 6h2v4h-2zM11 16h2v4h-2zM13 14h2v4h-2zM15 12h2v4h-2zM17 10h2v4h-2zM19 8h2v4h-2zM21 6h2v4h-2z");
// Disconnect: the chain link, struck through ("link off") —
// Pixelarticons' unlink reads as "⊂|⊃" at text size (2026-10-03).
export const LinkBroken = pixel("M4 6h5v2h-5zM2 8h2v8h-2zM4 16h7v2h-7zM15 6h5v2h-5zM20 8h2v8h-2zM17 16h3v2h-3zM7 11h2v2h-2zM15 11h2v2h-2zM2 2h2v2h-2zM4 4h2v2h-2zM6 6h2v2h-2zM8 8h2v2h-2zM10 10h2v2h-2zM12 12h2v2h-2zM14 14h2v2h-2zM16 16h2v2h-2zM18 18h2v2h-2zM20 20h2v2h-2z");
// A comic: a page of panels with a speech balloon in the top one, for the
// "ask for the graphic novel" key (2026-10-03) — the set has a book and a
// speech bubble, and a graphic novel is neither on its own. Drawn to the
// open book's full 24-unit width so the two keys weigh the same side by side.
export const Comic = pixel("M0 2h24v2H0zM0 20h24v2H0zM0 4h2v16H0zM22 4h2v16h-2zM2 11h20v2H2zM11 13h2v7h-2zM5 5h11v4H5zM7 9h2v2H7z");
// A finer filled star, its point one unit wide: Family Hub's "Pick a few you
// love" in Read (2026-10-04). StarFilled above is the same idea on the 2×2 grid.
export const StarFilledPointed = pixel("M11 2h2v2h-2zM10 4h4v2h-4zM9 6h6v2h-6zM2 8h20v2h-20zM4 10h16v2h-16zM6 12h12v2h-12zM6 14h12v2h-12zM5 16h5v2h-5zM14 16h5v2h-5zM4 18h4v2h-4zM16 18h4v2h-4zM3 20h3v2h-3zM18 20h3v2h-3z");
let pixelEverywhere = false;
/**
 * For an app whose icons are pixel icons in every look (Family Hub, whose
 * rule is "pixel icons, never emoji or line icons"): Skin and Glyph then pick
 * the pixel one whatever the skin theme. Call once at boot. Off by default:
 * the template apps keep their line icons and emoji outside Phosphor.
 */
export function configurePixel({ everywhere }) {
    pixelEverywhere = everywhere;
}
/** The pixel icon under Phosphor (or everywhere, see configurePixel); whatever was there before otherwise. */
export function Skin({ px, children }) {
    const [theme] = useSkinTheme();
    return _jsx(_Fragment, { children: pixelEverywhere || theme === "phosphor" ? px : children });
}
// Emoji the apps use as marks, and the pixel icon each becomes under Phosphor.
// An emoji a person chose (a team icon, a note) is theirs and is never swapped.
const GLYPHS = {
    "🏆": Trophy, "🥈": Trophy, "🔥": Fire, "🌶": Fire, "🧊": Snowflake, "❄": Snowflake, "❄️": Snowflake,
    "⚡": Zap, "🎯": Target, "💪": HumanArmsUp, "💎": DiamondGem, "🔒": Lock, "📅": Calendar, "📊": ChartBarBig,
    "🎉": PartyPopper, "✅": Check, "⚠": WarningDiamond, "✂": Cut, "★": StarFilled,
};
/** Add an app's own marks (its ball, say) to the emoji Glyph knows. */
export function registerGlyphs(more) {
    Object.assign(GLYPHS, more);
}
/** An app emoji: itself in light and dark, its pixel icon under Phosphor (or everywhere, see configurePixel). */
export function Glyph({ e, className }) {
    const [theme] = useSkinTheme();
    const Px = GLYPHS[e];
    return (pixelEverywhere || theme === "phosphor") && Px ? _jsx(Px, { className: `px-icon${className ? ` ${className}` : ""}` }) : _jsx(_Fragment, { children: e });
}
