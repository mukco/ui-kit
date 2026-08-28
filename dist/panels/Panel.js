import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { SectionLabel } from "../primitives/SectionLabel";
import { sportsIdentity } from "../sports/config";
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
/**
 * The height of a panel sitting in a dashboard row. Exported because the row's
 * other tenants — a news list, an insights card — are different components and
 * have to agree with it. Three panels side by side at three heights is what
 * this constant exists to prevent.
 */
export const PANEL_HEIGHT = 220;
export function Panel({ label, action, 
/** Fixed height so a row of panels lines up. `null` grows to fit. */
height = PANEL_HEIGHT, 
/** Wrap the children in the scrolling region. Off when the panel splits. */
scroll = true, children, className, }) {
    return (_jsxs("div", { className: cn("ui-card ui-panel", className), style: height != null ? { height } : undefined, children: [label != null && _jsx(SectionLabel, { action: action, children: label }), scroll ? _jsx("div", { className: "ui-panel-scroll", children: children }) : children] }));
}
/**
 * One row in a panel: a divider under it, none under the last. An `href` makes
 * the whole row the click target, with the app's own link so it does not
 * reload the page.
 */
export function PanelRow({ href, 
/** Stack the children instead of laying them in a line — a row that carries a
    bar or a second line under its content. A prop, so a caller never reaches
    for its own layout class on a shared row. */
stack = false, children, className, }) {
    const cls = cn("ui-panelrow", stack && "ui-panelrow--stack", href && "ui-panelrow--link", className);
    if (!href)
        return _jsx("div", { className: cls, children: children });
    const identity = sportsIdentity();
    return identity.link ? (identity.link({ href, className: cls, children })) : (_jsx("a", { className: cls, href: href, children: children }));
}
/**
 * Two labelled lists side by side with a rule between them — Recent and
 * Upcoming. The rule is the whole reason it reads as two panels rather than one
 * undivided block. Put it in a Panel with scroll={false}; each side scrolls on
 * its own.
 */
export function PanelSplit({ leftLabel, rightLabel, left, right, }) {
    return (_jsxs("div", { className: "ui-panel-split", children: [_jsxs("div", { className: "ui-panel-col", children: [_jsx(SectionLabel, { children: leftLabel }), _jsx("div", { className: "ui-panel-scroll", children: left })] }), _jsxs("div", { className: "ui-panel-col ui-panel-col--right", children: [_jsx(SectionLabel, { children: rightLabel }), _jsx("div", { className: "ui-panel-scroll", children: right })] })] }));
}
/** The italic grey line a panel shows when it has nothing to list. */
export function PanelEmpty({ children }) {
    return _jsx("p", { className: "ui-panel-empty", children: children });
}
