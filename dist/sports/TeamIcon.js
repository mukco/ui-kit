import { jsx as _jsx } from "react/jsx-runtime";
import { sportsIdentity } from "./config";
/** A team's crest from the app-configured logoUrl. */
export function TeamIcon({ teamId, size = 20 }) {
    const identity = sportsIdentity();
    return (_jsx("img", { className: "ui-team-icon", src: identity.logoUrl(teamId), alt: "", width: size, height: size, loading: "lazy", 
        // logoUrl is a template, not a lookup — it produces a URL for any
        // teamId whether or not that crest exists on the CDN. Hiding on 404
        // beats a broken-image glyph sitting in a row of otherwise-clean icons.
        onError: (e) => { e.currentTarget.style.display = "none"; } }));
}
