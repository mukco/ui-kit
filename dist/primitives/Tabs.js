import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
/** The horizontal tab strip every screen uses; wraps on phones. */
export function Tabs({ tabs, active, onChange, className }) {
    return (_jsx("div", { className: cn("ui-tabs", className), role: "tablist", children: tabs.map((t) => (_jsx("button", { role: "tab", "aria-selected": t.id === active, type: "button", className: cn("ui-tab", t.id === active && "ui-tab--active"), onClick: () => onChange(t.id), children: t.label }, t.id))) }));
}
