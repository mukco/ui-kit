import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/**
 * The button.
 *
 * The kit shipped a chip, a toggle, a tab and a nav item and never a button,
 * so every app invented one — `.btn`, `.btn-quiet`, `.mac-btn`, and inside
 * this kit a `.ui-triage-action` that was a button in all but name and matched
 * none of them. That is why the estate's actions looked like they came from a
 * different application: they did.
 *
 * Tones rather than colours, so an app cannot ask for a red button that means
 * nothing. Sizes rather than pixels, because the only two that have ever been
 * wanted are "in a row of text" and "on its own".
 */
export function Button({ children, onClick, href, external, tone = "quiet", size = "md", icon, disabled, title, type = "button", className, }) {
    const classes = cn("ui-btn", `ui-btn--${tone}`, size === "sm" && "ui-btn--sm", icon && "ui-btn--icon", className);
    if (href && !disabled) {
        return (_jsxs("a", { className: classes, href: href, title: title, ...(external ? { target: "_blank", rel: "noreferrer" } : {}), children: [children, external && _jsx("span", { "aria-hidden": "true", children: " \u2197" })] }));
    }
    return (_jsx("button", { type: type, className: classes, onClick: onClick, disabled: disabled, title: title, children: children }));
}
