import { useEffect } from "react";
const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");
/**
 * What `aria-modal="true"` actually promises, implemented once.
 *
 * Four things, and a dialog that keeps three of them is still broken: focus
 * moves in when it opens, Tab and Shift+Tab cycle inside it, the page behind
 * does not scroll, and focus returns to whatever opened it. Declaring the ARIA
 * without these is worse than declaring nothing — assistive tech tells the
 * user everything outside is inert, and then Tab walks them out into it.
 *
 * Shared by Drawer and ConfirmDialog so the two cannot drift; a focus trap
 * that is subtly different in two places is two bugs waiting.
 */
export function useFocusTrap(open, ref, onEscape) {
    useEffect(() => {
        if (!open)
            return;
        const returnTo = document.activeElement;
        const node = ref.current;
        // The container itself is the fallback: a dialog of static text still has
        // to take focus, or the reader is left outside something claiming modality.
        const first = node?.querySelector(FOCUSABLE) ?? node;
        first?.focus();
        const onKey = (e) => {
            if (e.key === "Escape" && onEscape)
                return onEscape();
            if (e.key !== "Tab" || !node)
                return;
            const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const edge = e.shiftKey ? items[0] : items[items.length - 1];
            if (document.activeElement === edge || !node.contains(document.activeElement)) {
                e.preventDefault();
                (e.shiftKey ? items[items.length - 1] : items[0]).focus();
            }
        };
        document.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            returnTo?.focus?.();
        };
    }, [open, ref, onEscape]);
}
