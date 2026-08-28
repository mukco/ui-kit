import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
function Side({ side }) {
    // A logo URL that 404s has to fall back to initials, not to an empty circle.
    // Hiding the <img> on error is not enough — there is nothing behind it.
    const [broken, setBroken] = useState(false);
    const showImage = !!side.logoUrl && !broken;
    return (_jsxs("div", { className: "ui-matchup-side", children: [_jsx("span", { className: "ui-matchup-logo", "aria-hidden": "true", children: showImage ? (_jsx("img", { src: side.logoUrl, alt: "", onError: () => setBroken(true) })) : (side.name.slice(0, 2).toUpperCase()) }), _jsx("span", { className: "ui-matchup-name", children: side.name }), side.record != null && _jsx("span", { className: "ui-matchup-record", children: side.record })] }));
}
/**
 * Two sides, a state chip, an optional photograph behind it, and a slot for
 * whatever the sport puts at the bottom.
 *
 * This is the shell only. What goes in `foot` is the app's business —
 * baseball's probable pitchers and lineup toggle, football's spread and
 * possession — but the proportions, the type scale and the way a matchup is
 * laid out live here, so the two cannot drift apart. Two apps hand-rolling
 * this and copying each other's measurements is exactly what it replaces.
 */
export function MatchupCard({ away, home, status, tone = "upcoming", dim = false, badges, meta, art, middle, foot, detail, highlighted, onClick, className, }) {
    // Dim the side that is behind, once there is a result to be behind in.
    //
    // This used to compute `homeWins` and then dim away-when-homeWins,
    // home-when-not. With tone "upcoming" homeWins is false, so the home score
    // was dimmed in every game that had not started — a losing side in a game
    // with no score. It also only ever applied at "final", so a live game
    // showed both scores equally weighted.
    const decided = tone !== "upcoming" &&
        home.score != null &&
        away.score != null &&
        Number(home.score) !== Number(away.score);
    const awayBehind = decided && Number(away.score) < Number(home.score);
    const homeBehind = decided && Number(home.score) < Number(away.score);
    const body = (_jsxs(_Fragment, { children: [art && (_jsx("div", { "aria-hidden": "true", className: "ui-matchup-art", style: { backgroundImage: `url(${art})` }, children: _jsx("div", { className: "ui-matchup-scrim" }) })), (status != null || badges || meta) && (_jsxs("div", { className: "ui-matchup-head", children: [status != null && _jsx("span", { className: `ui-matchup-status ui-matchup-status--${tone}`, children: status }), badges, meta && _jsx("span", { className: "ui-matchup-meta", children: meta })] })), _jsxs("div", { className: "ui-matchup-body", children: [_jsx(Side, { side: away }), _jsx("div", { className: "ui-matchup-mid", children: middle ?? (_jsxs("span", { className: "ui-matchup-score", children: [_jsx("span", { className: cn(awayBehind && "ui-matchup-loser"), children: away.score ?? "–" }), _jsx("span", { className: "ui-matchup-sep", children: "\u2013" }), _jsx("span", { className: cn(homeBehind && "ui-matchup-loser"), children: home.score ?? "–" })] })) }), _jsx(Side, { side: home })] }), (foot || detail) && (_jsx("div", { className: "ui-matchup-foot", children: foot ?? _jsx("p", { className: "ui-matchup-detail", children: detail }) }))] }));
    const classes = cn("ui-card", "ui-matchup", onClick && "ui-matchup--link", highlighted && "ui-matchup--on", dim && "ui-matchup--dim", className);
    // A button element cannot legally contain the interactive controls apps put
    // in `foot` (baseball's lineup toggle, a watch link), so a clickable card is
    // a div with a button role rather than a real <button>.
    if (onClick) {
        return (_jsx("div", { className: classes, role: "button", tabIndex: 0, onClick: onClick, onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }, children: body }));
    }
    return _jsx("div", { className: classes, children: body });
}
