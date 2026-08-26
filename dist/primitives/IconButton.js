import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../cn";
/**
 * A square, bordered icon button — baseball's nav control, extracted.
 *
 * Every app was rolling its own: estate had a bare glyph for search, a
 * borderless bell and a bordered text button for sign-out, all in one row.
 * This is the one shape, so a cluster of them reads as a cluster.
 *
 * `label` becomes both aria-label and title, because an icon button needs to
 * announce itself and to answer a hover.
 */
export function IconButton({ label, children, className, ...rest }) {
    return (_jsx("button", { type: "button", className: cn("ui-iconbtn", className), "aria-label": label, title: label, ...rest, children: children }));
}
