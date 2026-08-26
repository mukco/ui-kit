import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
import { useRovingSelect } from "./useRovingSelect";
/**
 * The horizontal tab strip every screen uses; wraps on phones.
 *
 * role="tablist" tells assistive tech this is one tab stop navigated with the
 * arrow keys. It said so and implemented neither, so a screen reader user was
 * told how the widget worked and then found it did not.
 */
export function Tabs({ tabs, active, onChange, className }) {
    const onKeyDown = useRovingSelect(tabs.map((t) => t.id), active, onChange);
    return (_jsx("div", { className: cn("ui-tabs", className), role: "tablist", onKeyDown: onKeyDown, children: tabs.map((t) => (_jsx("button", { role: "tab", "aria-selected": t.id === active, 
            // The other half of a roving tabindex: one stop for the group, and
            // it is whichever tab is current.
            tabIndex: t.id === active ? 0 : -1, type: "button", className: cn("ui-tab", t.id === active && "ui-tab--active"), onClick: () => onChange(t.id), children: t.label }, t.id))) }));
}
