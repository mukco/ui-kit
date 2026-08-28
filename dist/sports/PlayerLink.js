import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { cn } from "../cn";
import { Avatar } from "../primitives/Avatar";
import { sportsIdentity } from "./config";
/**
 * Player identity line: headshot + name, linked to the player's page when the
 * app configured playerHref. With no id but a name, resolves once.
 *
 * Both consuming apps hand-rolled this before, and the differences that kept
 * them from adopting it were all extension points rather than behaviour: a
 * hover card, stopPropagation inside a clickable row, and a photo-set variant.
 * Those are `wrap`, `stopPropagation` and `photoVariant`. Resolution goes
 * through `resolvePlayer`, so an app that wants it cached supplies a cached
 * implementation rather than the kit growing a query library.
 */
export function PlayerLink({ player, size = 28, avatarOnly = false, resolveName, className, imageClassName, textClassName, stopPropagation = false, wrap, photoVariant, live = false, }) {
    const identity = sportsIdentity();
    const [resolved, setResolved] = useState(null);
    const name = player.name ?? null;
    const lookupName = resolveName ?? name;
    let effectiveId = player.id != null && player.id !== "" ? player.id : null;
    const needsLookup = effectiveId == null && !!lookupName && !!identity.resolvePlayer;
    useEffect(() => {
        if (!needsLookup || !lookupName || !identity.resolvePlayer)
            return;
        let alive = true;
        identity.resolvePlayer(lookupName).then((match) => {
            if (alive && match?.id != null)
                setResolved(match.id);
        });
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsLookup, lookupName]);
    if (effectiveId == null && resolved != null)
        effectiveId = resolved;
    const href = effectiveId != null && identity.playerHref ? identity.playerHref(effectiveId) : null;
    const photo = effectiveId != null ? identity.photoUrl(effectiveId, size, photoVariant) : "";
    const face = (_jsx(Avatar, { name: name, src: photo || null, size: size, className: cn(live && "ui-player-avatar--live", imageClassName) }));
    const label = !avatarOnly && name ? _jsx("span", { className: cn("ui-player-name", textClassName), children: name }) : null;
    const body = (_jsxs(_Fragment, { children: [face, label] }));
    if (href == null || effectiveId == null) {
        return _jsx("span", { className: cn("ui-player", className), children: body });
    }
    const onClick = stopPropagation ? (e) => e.stopPropagation() : undefined;
    const link = identity.link ? (identity.link({ href, className: cn("ui-player", className), children: body, onClick })) : (_jsx("a", { className: cn("ui-player", className), href: href, onClick: onClick, children: body }));
    return wrap ? wrap(link, effectiveId) : link;
}
