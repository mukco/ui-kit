import { type RefObject } from "react";
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
export declare function useFocusTrap(open: boolean, ref: RefObject<HTMLElement | null>, onEscape?: () => void): void;
