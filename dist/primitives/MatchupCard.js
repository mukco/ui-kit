import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from "../cn";
function Side({ side }) {
    return (_jsxs("div", { className: "ui-matchup-side", children: [_jsx("span", { className: "ui-matchup-logo", "aria-hidden": "true", children: side.logoUrl ? (_jsx("img", { src: side.logoUrl, alt: "", onError: (e) => (e.currentTarget.style.display = "none") })) : (side.name.slice(0, 2).toUpperCase()) }), _jsx("span", { className: "ui-matchup-name", children: side.name })] }));
}
/** Two sides, a state chip, optional detail line. Games, series, trivia
    matchups — anything that is "these two, at it". */
export function MatchupCard({ away, home, status, tone = "upcoming", detail, onClick, className }) {
    const homeWins = tone === "final" &&
        home.score != null &&
        away.score != null &&
        Number(home.score) !== Number(away.score);
    const body = (_jsxs(_Fragment, { children: [_jsxs("div", { className: "ui-matchup-row", children: [_jsx(Side, { side: away }), _jsxs("div", { className: "ui-matchup-mid", children: [_jsx("span", { className: `ui-matchup-status ui-matchup-status--${tone}`, children: status ?? "" }), _jsxs("span", { className: "ui-matchup-score", children: [_jsx("span", { className: cn(homeWins && "ui-matchup-loser"), children: away.score ?? "–" }), _jsx("span", { className: "ui-matchup-sep", children: "\u00B7" }), _jsx("span", { className: cn(!homeWins && "ui-matchup-loser"), children: home.score ?? "–" })] })] }), _jsx(Side, { side: home })] }), detail && _jsx("p", { className: "ui-matchup-detail", children: detail })] }));
    if (onClick) {
        return (_jsx("button", { type: "button", className: cn("ui-card ui-matchup", "ui-matchup--link", className), onClick: onClick, children: body }));
    }
    return (_jsx("div", { className: cn("ui-card ui-matchup", className), children: body }));
}
