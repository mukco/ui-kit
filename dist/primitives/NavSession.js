import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Logout, SettingsCog, Sun } from "pixelarticons/react";
import { IconButton } from "./IconButton";
import { IconCrt, IconMoon, IconSettings, IconSignOut } from "./Icon";
import { nextSkinTheme, useSkinTheme } from "./skinTheme";
function useControls() {
    const [theme, setTheme] = useSkinTheme();
    const px = theme === "phosphor";
    const nextLabel = theme === "light" ? "Dark mode" : theme === "dark" ? "Phosphor" : "Light mode";
    // The icon shows where the button goes next.
    const themeIcon = theme === "light" ? _jsx(IconMoon, {}) : theme === "dark" ? _jsx(IconCrt, {}) : _jsx(Sun, { className: "ui-navsession-px" });
    return {
        settings: px ? _jsx(SettingsCog, { className: "ui-navsession-px" }) : _jsx(IconSettings, {}),
        signOut: px ? _jsx(Logout, { className: "ui-navsession-px" }) : _jsx(IconSignOut, {}),
        themeIcon, nextLabel,
        toggle: () => setTheme(nextSkinTheme(theme)),
    };
}
export function NavSessionButtons({ email, onSettings, onSignOut }) {
    const c = useControls();
    return (_jsxs(_Fragment, { children: [_jsx("span", { className: "ui-navsession", children: _jsx(IconButton, { label: "Settings", onClick: onSettings, children: c.settings }) }), _jsx("span", { className: "ui-navsession", children: _jsx(IconButton, { label: email ? `Sign out (${email})` : "Sign out", onClick: onSignOut, children: c.signOut }) }), _jsx("span", { className: "ui-navsession", children: _jsx(IconButton, { label: `Switch to ${c.nextLabel}`, onClick: c.toggle, children: c.themeIcon }) })] }));
}
export function NavSessionDrawer({ onSettings, onSignOut }) {
    const c = useControls();
    return (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", className: "ui-nav-mobile-link", onClick: onSettings, children: [c.settings, " Settings"] }), _jsxs("button", { type: "button", className: "ui-nav-mobile-link", onClick: onSignOut, children: [c.signOut, " Sign out"] }), _jsxs("button", { type: "button", className: "ui-nav-mobile-link", onClick: c.toggle, children: [c.themeIcon, " ", c.nextLabel] })] }));
}
