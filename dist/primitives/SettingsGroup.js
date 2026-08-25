import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** One titled card of SettingRows — the unit baseball's settings page stacks.
    Compose groups under a PageHeader and you have the whole screen. */
export function SettingsGroup({ title, description, children, className }) {
    return (_jsxs("section", { className: cn("ui-card ui-settingsgroup", className), children: [_jsxs("header", { className: "ui-settingsgroup-head", children: [_jsx("h2", { children: title }), description && _jsx("p", { children: description })] }), _jsx("div", { children: children })] }));
}
