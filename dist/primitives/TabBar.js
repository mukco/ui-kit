import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TabBar({ tabs, pathname, onNavigate, label = "Sections" }) {
    const here = (t) => t.match.some((m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`)));
    return (_jsx("nav", { className: "ph-tabbar", "aria-label": label, children: _jsx("div", { className: "ph-tabbar-track", children: tabs.map((t) => (_jsxs("button", { type: "button", className: `ph-tab${here(t) ? " ph-tab--here" : ""}`, "aria-current": here(t) ? "page" : undefined, onClick: () => onNavigate(t.to), children: [_jsx(t.Icon, { className: "ph-tab-icon", "aria-hidden": "true" }), _jsx("span", { children: t.label })] }, t.to))) }) }));
}
