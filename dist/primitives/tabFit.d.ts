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
    widths: number[];
    /** More's natural frame width. */
    moreWidth: number;
    /** The width the slots share. 0 (not laid out, e.g. hidden) shows every tab. */
    room: number;
    /** The gap between slots. */
    gap: number;
    /** Index of the current page's tab, or -1. */
    here: number;
    /** More is there even when every tab fits (the app has places only it reaches). */
    alwaysMore: boolean;
    /** A slot never narrower than this: the touch target floor. */
    minSlot?: number;
}
/** The tabs shown for a count: the first `count`, the current one swapped into the last slot if it was past them. */
export declare function shownTabs(total: number, count: number, here: number): number[];
/** The width each of `slots` equal slots gets. */
export declare function slotWidth(room: number, gap: number, slots: number): number;
/**
 * How many tabs to show (the rest go under More). Never fewer than one: on a
 * screen too narrow for even one tab and More at 44px each, that one is shown
 * below the floor rather than no tab at all.
 */
export declare function fitTabs({ widths, moreWidth, room, gap, here, alwaysMore, minSlot }: TabFitInput): number;
export interface MoreSheetEntry {
    to: string;
    label: string;
    here: boolean;
}
export interface MoreSheetSection {
    heading?: string;
    entries: MoreSheetEntry[];
}
/**
 * More's sheet, in sections: the tabs that did not fit first, under one
 * heading, then the app's own items in runs of the same group (a run with no
 * group has no heading, and is still a section of its own, so it never reads
 * as part of the run above). An item whose path is also a tab is dropped:
 * that tab is in the bar or already at the top.
 */
export declare function moreSections(overflow: {
    to: string;
    label: string;
    match: string[];
}[], items: {
    to: string;
    label: string;
    group?: string;
}[], allTabs: {
    to: string;
}[], pathname: string, heading: string): MoreSheetSection[];
