/**
 * The kit's horizontal scrollers: tables, segmented strips, the SQL editor, and any element an
 * app marks `.ui-scrollx` or `[data-scroll-edges]`.
 */
export declare const SCROLL_EDGE_TABLES = ".ui-tablescroll";
export declare const SCROLL_EDGE_STRIPS = ".ui-scrollx, .ui-segmented, .ui-sb-editor .cm-scroller, [data-scroll-edges]";
export interface ScrollEdgesOptions {
    /** Where to look; defaults to document.body. A selector or an element. */
    root?: string | HTMLElement | null;
    /** The app's own tables (a pinned name column on the left): faded on the right only. */
    tables?: string;
    /** The app's own strips (chips, sub-tabs): faded on whichever side has more. */
    strips?: string;
    /** Off while signed out, say. */
    enabled?: boolean;
}
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
export declare function useScrollEdges({ root, tables, strips, enabled }?: ScrollEdgesOptions): void;
