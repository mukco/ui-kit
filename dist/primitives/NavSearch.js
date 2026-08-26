import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { cn } from "../cn";
import { IconSearch } from "./Icon";
/**
 * The search field in a nav bar — baseball's, extracted.
 *
 * The icon lives *inside* the field rather than beside it. That is the whole
 * difference between "a text input, and separately a magnifier" and "a search
 * box": the affordance is the box, and a glyph parked next to it reads as
 * another button in the row of buttons.
 *
 * The ⌘K hint is a `kbd`, hidden on narrow screens where there is no keyboard
 * to press it with and no room to say so.
 */
export function NavSearch({ value, onChange, placeholder = "Search…", label = "Search", busy, onKeyDown, shortcut, className, }) {
    const input = useRef(null);
    useEffect(() => {
        if (!shortcut)
            return;
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                input.current?.focus();
                input.current?.select();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [shortcut]);
    return (_jsxs("div", { className: cn("ui-navsearch", className), children: [_jsx(IconSearch, { className: "ui-navsearch-icon" }), _jsx("input", { ref: input, type: "search", className: "ui-navsearch-input", value: value, placeholder: placeholder, "aria-label": label, onChange: (e) => onChange(e.target.value), onKeyDown: onKeyDown }), busy && _jsx("span", { className: "ui-navsearch-busy ui-spinner", "aria-hidden": "true" }), shortcut && (_jsx("kbd", { className: "ui-navsearch-kbd", "aria-hidden": "true", children: "\u2318K" }))] }));
}
