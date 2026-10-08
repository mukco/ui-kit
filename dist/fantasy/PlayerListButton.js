import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowsHorizontal, Close, Cut, Eye } from "pixelarticons/react";
import { cn } from "../cn";
import { Skin } from "../primitives/Pixel";
const META = {
    watch: { label: "Watchlist" },
    cut: { label: "Cut List" },
    trade: { label: "Trade" },
};
const line = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
function LineIcon({ list }) {
    if (list === "cut")
        return _jsxs("svg", { ...line, children: [_jsx("circle", { cx: "6", cy: "6", r: "3" }), _jsx("circle", { cx: "6", cy: "18", r: "3" }), _jsx("path", { d: "M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" })] });
    if (list === "trade")
        return _jsxs("svg", { ...line, children: [_jsx("path", { d: "M16 3l4 4-4 4" }), _jsx("path", { d: "M20 7H4" }), _jsx("path", { d: "M8 21l-4-4 4-4" }), _jsx("path", { d: "M4 17h16" })] });
    return _jsxs("svg", { ...line, children: [_jsx("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] });
}
const PX = { watch: Eye, cut: Cut, trade: ArrowsHorizontal };
export function PlayerListButton({ list = "watch", on, onToggle, pending, failed, disabled, disabledTitle, size = "sm", labelled, className }) {
    const name = META[list].label;
    const title = disabled ? (disabledTitle ?? name) : failed ? `Saved here — the ${name} sync failed` : on ? `Remove from ${name}` : `Add to ${name}`;
    const Px = PX[list];
    const word = labelled && list === "watch" ? (on ? "Watching" : "Watch") : labelled ? name : null;
    return (_jsxs("button", { type: "button", className: cn("ui-listbtn", `ui-listbtn--${list}`, size === "md" && "ui-listbtn--md", labelled && "ui-listbtn--labelled", on && "ui-listbtn--on", failed && "ui-listbtn--failed", pending && "ui-listbtn--pending", className), "aria-pressed": on, "aria-label": labelled ? undefined : title, title: title, disabled: disabled, onClick: (e) => { e.stopPropagation(); e.preventDefault(); onToggle(); }, children: [_jsx(Skin, { px: _jsx(Px, { className: "px-icon ui-listbtn-icon", "aria-hidden": "true" }), children: _jsx(LineIcon, { list: list }) }), word && _jsx("span", { children: word })] }));
}
/** The eye. */
export function WatchButton(props) {
    return _jsx(PlayerListButton, { ...props, list: "watch" });
}
/**
 * The players you are watching, as one list in every app: the player, a line
 * under him, a cell at the right, and the eye to let him go.
 */
export function WatchList({ rows, onRemove, empty = "Nobody yet — tap the eye on a player to watch him.", className }) {
    if (rows.length === 0)
        return _jsx("p", { className: cn("ui-watchlist-empty", className), children: empty });
    return (_jsx("ul", { className: cn("ui-watchlist", className), children: rows.map((r) => (_jsxs("li", { className: "ui-watchlist-row", children: [_jsxs("span", { className: "ui-watchlist-who", children: [_jsx("span", { className: "ui-watchlist-player", children: r.player }), r.meta != null && _jsx("span", { className: "ui-watchlist-meta", children: r.meta })] }), r.aside != null && _jsx("span", { className: "ui-watchlist-aside", children: r.aside }), _jsx("button", { type: "button", className: "ui-watchlist-remove", onClick: () => onRemove(r.id), "aria-label": "Stop watching", title: "Stop watching", children: _jsx(Skin, { px: _jsx(Close, { className: "px-icon", "aria-hidden": "true" }), children: _jsx("svg", { ...line, width: 14, height: 14, children: _jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }) }) })] }, r.id))) }));
}
