import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** An award: big icon, what it was for, who got it. Sport-neutral on purpose —
    season MVPs and trivia crowns are the same shape. */
export function AwardCard({ icon, label, winner, detail, className }) {
    return (_jsxs("div", { className: cn("ui-card ui-award", className), children: [_jsx("span", { className: "ui-award-icon", "aria-hidden": "true", children: icon }), _jsx("span", { className: "ui-award-label", children: label }), winner != null && _jsx("span", { className: "ui-award-winner", children: winner }), detail != null && _jsx("span", { className: "ui-award-detail", children: detail })] }));
}
