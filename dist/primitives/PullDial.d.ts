import { type ReactNode } from "react";
export interface PullDialProps {
    /** A short pull: re-fetch what is on screen. The dial turns until it settles. */
    onRefresh: () => Promise<unknown>;
    /** A long pull goes here. Without it there is no Home stage (you are home). */
    onHome?: () => void;
    enabled?: boolean;
    /** False while a refresh would lose something: a short pull does nothing. */
    canRefresh?: boolean;
    /** What slides down to uncover the band. The section swipe's element by default. */
    page?: string;
    /** The band hangs from the bottom of this — the app's bar. */
    under?: string;
    /** The Home stage's mark. */
    homeIcon?: ReactNode;
}
/**
 * Family Hub's pull-down (its web/src/shell/PullDial.tsx), for the kit's
 * apps: at the very top of a page, a little pull refreshes it and a long one
 * goes home.
 *
 * The listeners are set up once and the page is moved by hand, 1:1 with the
 * finger and damped, with no React state per move. Family Hub's first version
 * re-rendered on every pixel and tore its listeners down and put them back
 * each time, so pulls lagged and a lift that landed between the two was lost.
 *
 * The page slides down and a band tucked behind it under the bar opens to the
 * same height, saying what letting go will do: a ring fills as you pull, then
 * goes solid with ↑ for Refresh, and turns with ⟳ while it runs; pulled on,
 * it shows the house for Home. Each
 * new stage pops, so you feel it change without looking for it.
 *
 * Only starts at the very top, never inside anything that owns the touch
 * (OWNS_TOUCH) or a box scrolled down inside the page, and never while a
 * section swipe or an open sheet has the page (body[data-swiping]).
 *
 *   <PullDial onRefresh={refetchVisible} onHome={atHome ? undefined : goHome} />
 */
export declare function PullDial({ onRefresh, onHome, enabled, canRefresh, page, under, homeIcon }: PullDialProps): import("react").ReactPortal | null;
