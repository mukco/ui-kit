import { useCallback, type KeyboardEvent } from "react"

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
export function useRovingSelect<T extends string>(
  ids: readonly T[],
  current: T,
  onSelect: (id: T) => void,
) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]
      if (!keys.includes(event.key)) return

      const at = ids.indexOf(current)
      // A group whose current value is not in the list — mid-update, or a
      // caller passing something stale. Arrowing from nowhere is meaningless,
      // so leave the event to the browser.
      if (at === -1) return

      let next: number
      switch (event.key) {
        case "Home":
          next = 0
          break
        case "End":
          next = ids.length - 1
          break
        case "ArrowRight":
        case "ArrowDown":
          // Wraps. A three-option group is a ring, and stopping at the end
          // makes the last option a dead end for no reason.
          next = (at + 1) % ids.length
          break
        default:
          next = (at - 1 + ids.length) % ids.length
      }

      // Only now, once we know the key was ours: arrow keys otherwise scroll
      // the page, and a group that swallows them when it did nothing is its
      // own bug.
      event.preventDefault()
      onSelect(ids[next])

      // Focus follows selection, which is the point of a roving tabindex — the
      // newly selected option becomes the group's single tab stop, so it has to
      // be where focus is.
      const group = event.currentTarget
      const options = group.querySelectorAll<HTMLElement>('[role="tab"],[role="radio"]')
      options[next]?.focus()
    },
    [ids, current, onSelect],
  )
}
