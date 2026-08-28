import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { sportsIdentity } from "./config";
import { TeamIcon } from "./TeamIcon";
/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export function TeamLink({ teamId, name, size = 18, textClassName }) {
    const href = sportsIdentity().teamHref?.(teamId);
    const face = _jsx(TeamIcon, { teamId: teamId, size: size });
    const label = textClassName ? _jsx("span", { className: textClassName, children: name }) : name;
    if (href) {
        return (_jsxs("a", { className: "ui-team-link", href: href, children: [face, label] }));
    }
    return (_jsxs("span", { className: "ui-team-link", children: [face, label] }));
}
