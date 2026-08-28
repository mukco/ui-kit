import type { ReactNode } from "react";
/**
 * The dashboard panel, its rows, and the two-column split.
 *
 * These existed twice — `.bb-fav-panel`/`.fb-fav-panel`,
 * `.bb-fav-game-row`/`.fb-resultrow`, `.bb-fav-prow`/`.fb-statrankrow`,
 * `.bb-fav-games`/`.fb-recentupcoming-grid` — as two sets of CSS classes with
 * the same job and different values. Which is why one app had row dividers and
 * the other did not, and why fixing that in one place never fixed it in the
 * other. There is one set now and neither app defines these rules.
 */
export declare function Panel({ label, action, 
/** Fixed height so a row of panels lines up. `null` grows to fit. */
height, 
/** Wrap the children in the scrolling region. Off when the panel splits. */
scroll, children, className, }: {
    label?: ReactNode;
    action?: ReactNode;
    height?: number | string | null;
    scroll?: boolean;
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/**
 * One row in a panel: a divider under it, none under the last. An `href` makes
 * the whole row the click target, with the app's own link so it does not
 * reload the page.
 */
export declare function PanelRow({ href, children, className, }: {
    href?: string | null;
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/**
 * Two labelled lists side by side with a rule between them — Recent and
 * Upcoming. The rule is the whole reason it reads as two panels rather than one
 * undivided block. Put it in a Panel with scroll={false}; each side scrolls on
 * its own.
 */
export declare function PanelSplit({ leftLabel, rightLabel, left, right, }: {
    leftLabel: ReactNode;
    rightLabel: ReactNode;
    left: ReactNode;
    right: ReactNode;
}): import("react").JSX.Element;
/** The italic grey line a panel shows when it has nothing to list. */
export declare function PanelEmpty({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
