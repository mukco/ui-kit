import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** Whose team this is and how it stands: name, record, and the few numbers a manager checks first. */
export function FantasyTeamBar({ team, avatar, record, items, note, className }) {
    return (_jsxs("div", { className: cn("ui-card ui-fteambar", className), children: [_jsxs("span", { className: "ui-fteambar-id", children: [avatar, _jsx("span", { className: "ui-fteambar-name", children: team })] }), record != null && record !== "" && _jsx("span", { className: "ui-fteambar-rec", children: record }), items?.map((i) => _jsx("span", { className: cn("ui-fteambar-item", i.tone && `ui-fteambar-item--${i.tone}`), children: i.content }, i.key)), note != null && _jsx("span", { className: "ui-fteambar-note", children: note })] }));
}
/**
 * Main column plus sidebar. From 1024px the sidebar sits beside the main
 * column, sticky, scrolling on its own; narrower, it follows the main column
 * rather than disappearing, so a phone still reaches the league context.
 */
export function FantasyLayout({ children, sidebar, className }) {
    return (_jsxs("div", { className: cn("ui-flayout", !sidebar && "ui-flayout--single", className), children: [_jsx("div", { className: "ui-flayout-main", children: children }), sidebar && _jsx("aside", { className: "ui-flayout-side", children: sidebar })] }));
}
