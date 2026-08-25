import { jsx as _jsx } from "react/jsx-runtime";
import { sportsIdentity } from "./config";
/** A team's crest from the app-configured logoUrl. */
export function TeamIcon({ teamId, size = 20 }) {
    const identity = sportsIdentity();
    return (_jsx("img", { className: "ui-team-icon", src: identity.logoUrl(teamId), alt: "", width: size, height: size, loading: "lazy" }));
}
