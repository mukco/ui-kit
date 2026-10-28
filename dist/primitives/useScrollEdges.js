import { useEffect } from "react";
/**
 * The kit's horizontal scrollers: tables, segmented strips, the SQL editor, and any element an
 * app marks `.ui-scrollx` or `[data-scroll-edges]`.
 */
export const SCROLL_EDGE_TABLES = ".ui-tablescroll";
export const SCROLL_EDGE_STRIPS = ".ui-scrollx, .ui-segmented, .ui-sb-editor .cm-scroller, [data-scroll-edges]";
const join = (...parts) => parts.filter(Boolean).join(", ");
/**
 * Marks every horizontal scroller under `root` with `data-more-right` /
 * `data-more-left` (and `data-scroll-edges`) while it has more that way; ui.css fades that
 * edge. iOS draws no scrollbar, so without it a column cut mid-number, or a
 * view cut to "Mar", reads as the end of the table. A table's left edge is its
 * pinned name column, so tables only ever get `data-more-right`.
 *
 * Also brings a strip's open option into view the first time the strip is
 * seen, so a segmented control whose active choice sits past the edge does
 * not open looking like nothing is chosen.
 *
 * Mount it once, high in the app: one capturing scroll listener and one
 * mutation observer cover every scroller that comes and goes.
 */
export function useScrollEdges({ root, tables, strips, enabled = true } = {}) {
    useEffect(() => {
        if (!enabled || typeof document === "undefined" || typeof MutationObserver === "undefined")
            return;
        const el = typeof root === "string" ? document.querySelector(root) : root ?? document.body;
        if (!el)
            return;
        const tableSel = join(SCROLL_EDGE_TABLES, tables);
        const stripSel = join(SCROLL_EDGE_STRIPS, strips);
        const all = join(tableSel, stripSel);
        const seen = new WeakSet();
        const mark = (s) => {
            // [data-scroll-edges] is what ui.css keys the fade on: a bare
            // [data-more-*] rule would reach any element in any consumer that
            // happened to carry it. An attribute, not a class: CodeMirror rewrites
            // its scroller's className and would drop one.
            s.setAttribute("data-scroll-edges", "");
            const isTable = s.matches(tableSel) && !s.matches(stripSel);
            if (!isTable && !seen.has(s) && s.clientWidth > 0) {
                seen.add(s);
                const on = s.querySelector(".ui-segmented-btn--active, [aria-pressed='true'], [aria-selected='true']");
                if (on) {
                    // Measured against the strip itself, whatever the buttons' offsetParent.
                    const left = on.getBoundingClientRect().left - s.getBoundingClientRect().left + s.scrollLeft;
                    if (left + on.offsetWidth > s.clientWidth)
                        s.scrollLeft = left - (s.clientWidth - on.offsetWidth) / 2;
                }
            }
            s.toggleAttribute("data-more-right", s.scrollWidth - s.clientWidth - s.scrollLeft > 2);
            s.toggleAttribute("data-more-left", !isTable && s.scrollLeft > 2);
        };
        const markAll = () => el.querySelectorAll(all).forEach(mark);
        let frame = 0;
        const later = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(markAll);
        };
        // Scroll does not bubble; a capturing listener hears every scroller's.
        const onScroll = (e) => {
            if (e.target instanceof HTMLElement && e.target.matches(all))
                mark(e.target);
        };
        markAll();
        el.addEventListener("scroll", onScroll, { capture: true, passive: true });
        const mo = new MutationObserver(later);
        mo.observe(el, { childList: true, subtree: true });
        window.addEventListener("resize", later);
        return () => {
            cancelAnimationFrame(frame);
            el.removeEventListener("scroll", onScroll, { capture: true });
            mo.disconnect();
            window.removeEventListener("resize", later);
        };
    }, [root, tables, strips, enabled]);
}
