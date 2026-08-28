import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { sportsIdentity } from "./config";
import { TeamIcon } from "./TeamIcon";
/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export function TeamLink({ teamId, name, size = 18, textClassName }) {
    const identity = sportsIdentity();
    const href = identity.teamHref?.(teamId);
    const face = _jsx(TeamIcon, { teamId: teamId, size: size });
    const label = textClassName ? _jsx("span", { className: textClassName, children: name }) : name;
    const body = (_jsxs(_Fragment, { children: [face, label] }));
    if (href) {
        // `link` when the app gave us one — a plain <a> reloads the whole app.
        return identity.link
            ? identity.link({ href, className: "ui-team-link", children: body })
            : (_jsx("a", { className: "ui-team-link", href: href, children: body }));
    }
    return _jsx("span", { className: "ui-team-link", children: body });
}
