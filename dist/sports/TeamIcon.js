import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { sportsIdentity } from "./config";
/** A team's crest from the app-configured logoUrl, with an initials fallback. */
export function TeamIcon({ teamId, size = 20, name }) {
    const identity = sportsIdentity();
    // logoUrl is a template, not a lookup — it produces a URL for any teamId
    // whether or not that crest exists on the CDN. This used to hide the <img>
    // on error, which left a hole the size of an icon in a row of clean ones.
    const [broken, setBroken] = useState(false);
    const showImage = teamId != null && !broken;
    if (!showImage) {
        return (_jsx("span", { className: "ui-team-icon ui-team-icon--fallback", style: { width: size, height: size, fontSize: Math.round(size * 0.4) }, "aria-hidden": "true", children: (name ?? "").slice(0, 2).toUpperCase() }));
    }
    return (_jsx("img", { className: "ui-team-icon", src: identity.logoUrl(teamId), alt: "", width: size, height: size, loading: "lazy", onError: () => setBroken(true) }));
}
