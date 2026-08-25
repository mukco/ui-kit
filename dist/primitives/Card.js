import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** The kit's basic surface: bordered, rounded, subtly elevated. */
export function Card({ children, className, title }) {
    return (_jsxs("section", { className: cn("ui-card", className), children: [title && (_jsx("h3", { style: { margin: "0 0 0.5rem", fontSize: "0.95rem", color: "var(--text)" }, children: title })), children] }));
}
