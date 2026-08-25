import { type ReactNode } from "react";
export type LogLevel = "error" | "warn" | null;
export interface LogEntry {
    id: string | number;
    /** Short clock for the meta row, e.g. "02:11:44". */
    stamp?: string | null;
    /** Full timestamp, carried through to <time dateTime>. */
    isoStamp?: string | null;
    text: string;
    level?: LogLevel;
    /** Container or app name — shown when one stream merges several sources. */
    source?: string;
}
/**
 * What the line is, worked out once. Deliberately crude: these are several
 * apps' worth of unrelated log formats, and anything cleverer would be wrong
 * about most of them. A word has to stand alone to count — "errors_total=0" is
 * not an error, and neither is a path with "warning" in it.
 */
export declare function logLevelOf(text: string): LogLevel;
/**
 * Split a docker-shaped log body into entries. Pure — the app does the
 * fetching and hands the body here.
 *
 * docker writes an RFC 3339 stamp in front of every line. It is the only
 * trustworthy clock available (an app's own timestamps are whatever it decided
 * to print), but it is not what anybody is reading for, so it is split off the
 * message rather than left in front of it.
 */
export declare function parseLogBody(body: string, source?: string): LogEntry[];
interface Props {
    /** null while the app is still fetching. */
    entries: LogEntry[] | null;
    /** Freshness line under the stream: "300 lines · written 2m ago". */
    footer?: ReactNode;
    /** Lines a long entry folds to before it offers "Show all". */
    clampLines?: number;
    loadingLabel?: string;
    emptyLabel?: string;
    className?: string;
}
/**
 * A container's output, readable on a phone.
 *
 * Four things a log view has to get right on a small screen, all of them
 * CSS-driven so this is one component and not two:
 *
 * - **No box inside the page.** Above 640px the stream scrolls in its own
 *   pane; below it the height cap comes off and the page is the only scroll
 *   surface. A scrollable box inside a scrolling page is the single worst
 *   thing a log view does to a thumb.
 * - **The message gets the full width.** The entry is a two-column grid — meta,
 *   then text — which collapses to one column on phones, so the stamp sits
 *   above the message instead of eating a quarter of the line. The grid also
 *   gives wrapped lines a hanging indent for free.
 * - **Long lines fold.** A wrapped 400-character backtrace otherwise fills the
 *   viewport and buries everything after it.
 * - **No sideways scrolling.** The no-wrap escape hatch is hidden below 640px,
 *   where it would mean panning a nested scroller.
 *
 * Levels are a coloured edge *and* a word, never colour alone.
 */
export declare function LogStream({ entries, footer, clampLines, loadingLabel, emptyLabel, className, }: Props): import("react").JSX.Element;
export {};
