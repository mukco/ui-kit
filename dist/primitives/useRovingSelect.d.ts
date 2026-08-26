import { type KeyboardEvent } from "react";
/**
 * The keyboard model that `role="tablist"` and `role="radiogroup"` promise.
 *
 * Both roles tell assistive technology the same two things: the group is a
 * single tab stop, and the arrow keys move within it. Declaring the role and
 * implementing neither is worse than using plain buttons — a screen reader
 * announces "radio group, 3 items" and then Tab walks straight past, or lands
 * on every option in turn, and the user is left operating a widget that does
 * not behave the way they were just told it would.
 *
 * Both patterns also select on arrow rather than requiring a separate Return.
 * That is what WAI-ARIA specifies for radios and for tabs with automatic
 * activation, and it is what makes the single tab stop worth having: the whole
 * group costs one Tab and then one arrow per step.
 *
 * Pair with `tabIndex={isSelected ? 0 : -1}` on each option — that is the other
 * half of the contract and this hook cannot apply it for you.
 */
export declare function useRovingSelect<T extends string>(ids: readonly T[], current: T, onSelect: (id: T) => void): (event: KeyboardEvent<HTMLElement>) => void;
