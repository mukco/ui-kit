import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BellOff, BellRing } from "pixelarticons/react";
import { IconBell, IconBellOff } from "./Icon";
import { Skin } from "./Pixel";
/**
 * Follow a game: its start, periods and final reach this user's devices. One
 * line, bell and word together; the pixel bell under Phosphor. The app shows
 * it only where push is set up and the game isn't over.
 */
export function FollowButton({ on, onToggle, title }) {
    return (_jsxs("button", { type: "button", className: `ui-btn ui-btn--sm ui-follow${on ? " ui-follow--on" : ""}`, "aria-pressed": on, onClick: onToggle, title: on ? title.on : title.off, children: [_jsx(Skin, { px: on ? _jsx(BellRing, { className: "px-icon" }) : _jsx(BellOff, { className: "px-icon" }), children: on ? _jsx(IconBell, { size: 14 }) : _jsx(IconBellOff, { size: 14 }) }), _jsx("span", { children: on ? "Following" : "Follow" })] }));
}
