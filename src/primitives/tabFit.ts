/**
 * How many of a tab bar's tabs fit, laid out as equal slots with More last.
 *
 * Every slot is the same width — the bar's room shared evenly — so nothing is
 * left over as a ragged gap before More, and More is as wide as any tab. A tab
 * fits when its whole frame (icon, label, padding, border at its natural
 * width) fits its slot; More has to fit too. The page you are on is always
 * shown: when it would have overflowed it takes the last slot.
 *
 * Pure, so it can be tested without a layout engine; TabBar measures and
 * calls it.
 */
export interface TabFitInput {
  /** Each tab's natural frame width, in order. */
  widths: number[]
  /** More's natural frame width. */
  moreWidth: number
  /** The width the slots share. 0 (not laid out, e.g. hidden) shows every tab. */
  room: number
  /** The gap between slots. */
  gap: number
  /** Index of the current page's tab, or -1. */
  here: number
  /** More is there even when every tab fits (the app has places only it reaches). */
  alwaysMore: boolean
  /** A slot never narrower than this: the touch target floor. */
  minSlot?: number
}

/** The tabs shown for a count: the first `count`, the current one swapped into the last slot if it was past them. */
export function shownTabs(total: number, count: number, here: number): number[] {
  const shown = Array.from({ length: Math.min(count, total) }, (_, i) => i)
  if (here >= count && count > 0 && here < total) shown[shown.length - 1] = here
  return shown
}

/** The width each of `slots` equal slots gets. */
export function slotWidth(room: number, gap: number, slots: number): number {
  return slots > 0 ? (room - gap * (slots - 1)) / slots : room
}

/** How many tabs to show (the rest go under More). Never fewer than one. */
export function fitTabs({ widths, moreWidth, room, gap, here, alwaysMore, minSlot = 44 }: TabFitInput): number {
  const n = widths.length
  if (n === 0 || room <= 0) return n
  for (let k = n; k >= 1; k--) {
    const more = alwaysMore || k < n
    const slot = slotWidth(room, gap, k + (more ? 1 : 0))
    if (slot < minSlot) continue
    if (more && moreWidth > slot) continue
    if (shownTabs(n, k, here).every((i) => widths[i] <= slot)) return k
  }
  return 1
}
