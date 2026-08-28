import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { sportsIdentity } from "./config";
import { TeamIcon } from "./TeamIcon";
/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export function TeamLink({ teamId, name, size = 18, textClassName, className }) {
    const identity = sportsIdentity();
    const href = teamId == null ? undefined : identity.teamHref?.(teamId);
    const face = _jsx(TeamIcon, { teamId: teamId, size: size, name: typeof name === "string" ? name : null });
    const label = textClassName ? _jsx("span", { className: textClassName, children: name }) : name;
    const body = (_jsxs(_Fragment, { children: [face, label] }));
    const cls = cn("ui-team-link", className);
    if (href) {
        // `link` when the app gave us one — a plain <a> reloads the whole app.
        return identity.link
            ? identity.link({ href, className: cls, children: body })
            : (_jsx("a", { className: cls, href: href, children: body }));
    }
    return _jsx("span", { className: cls, children: body });
}
