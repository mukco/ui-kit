import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** One titled card of SettingRows — the unit baseball's settings page stacks.
    Compose groups under a PageHeader and you have the whole screen. */
export function SettingsGroup({ title, description, icon, tone = "brand", aside, children, className }) {
    return (_jsxs("section", { className: cn("ui-card ui-settingsgroup", className), children: [_jsxs("header", { className: cn("ui-settingsgroup-head", icon != null && "ui-settingsgroup-head--icon"), children: [icon != null && _jsx("span", { className: `ui-settingsgroup-icon ui-settingsgroup-icon--${tone}`, "aria-hidden": "true", children: icon }), _jsxs("div", { className: "ui-settingsgroup-headtext", children: [_jsx("h2", { children: title }), description && _jsx("p", { children: description })] }), aside != null && _jsx("div", { className: "ui-settingsgroup-aside", children: aside })] }), _jsx("div", { children: children })] }));
}
