import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sportsIdentity } from "./config";
import { TeamIcon } from "./TeamIcon";
/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export function TeamLink({ teamId, name, size = 18 }) {
    const href = sportsIdentity().teamHref?.(teamId);
    const face = _jsx(TeamIcon, { teamId: teamId, size: size });
    if (href) {
        return (_jsxs("a", { className: "ui-team-link", href: href, children: [face, name] }));
    }
    return (_jsxs("span", { className: "ui-team-link", children: [face, name] }));
}
