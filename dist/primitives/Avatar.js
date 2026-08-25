import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
function initials(name) {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length)
        return "?";
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}
/**
 * Round avatar: the photo when it loads, initials when it doesn't or when no
 * src exists. The box always occupies its size either way.
 */
export function Avatar({ name, src, size = 32, className }) {
    const [broken, setBroken] = useState(false);
    const px = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.38)) };
    return (_jsx("span", { className: cn("ui-avatar", className), style: px, title: name ?? undefined, children: src && !broken ? (_jsx("img", { src: src, alt: name ?? "", loading: "lazy", onError: () => setBroken(true) })) : (initials(name)) }));
}
