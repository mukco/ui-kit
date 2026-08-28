import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Avatar } from "../primitives/Avatar";
import { sportsIdentity } from "./config";
/**
 * Player identity line: headshot + name, linked to the player's page when the
 * app configured playerHref. With no id but a name, resolves once.
 */
export function PlayerLink({ player, size = 28, avatarOnly = false }) {
    const identity = sportsIdentity();
    const [resolved, setResolved] = useState(null);
    const name = player.name ?? null;
    let effectiveId = player.id != null && player.id !== "" ? player.id : null;
    const needsLookup = effectiveId == null && !!name && !!identity.resolvePlayer;
    useEffect(() => {
        if (!needsLookup || !name || !identity.resolvePlayer)
            return;
        let alive = true;
        identity.resolvePlayer(name).then((match) => {
            if (alive && match?.id != null)
                setResolved(match.id);
        });
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsLookup, name]);
    if (effectiveId == null && resolved != null)
        effectiveId = resolved;
    const href = effectiveId != null && identity.playerHref ? identity.playerHref(effectiveId) : null;
    const photo = effectiveId != null ? identity.photoUrl(effectiveId, size) : "";
    const face = _jsx(Avatar, { name: name, src: photo || null, size: size });
    const label = !avatarOnly && name ? _jsx("span", { className: "ui-player-name", children: name }) : null;
    const body = (_jsxs(_Fragment, { children: [face, label] }));
    if (href) {
        // `link` when the app gave us one — a plain <a> reloads the whole app.
        return identity.link
            ? identity.link({ href, className: "ui-player", children: body })
            : (_jsx("a", { className: "ui-player", href: href, children: body }));
    }
    return _jsx("span", { className: "ui-player", children: body });
}
