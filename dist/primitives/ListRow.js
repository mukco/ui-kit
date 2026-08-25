import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { StatusDot } from "./Status";
/**
 * One thing in a list of things.
 *
 * Estate had hand-rolled this four times over — failed jobs, running jobs,
 * worker processes and log-search hits — each with its own class names, its own
 * truncation rule and its own idea of how small the small print is. They are
 * the same row: a marker, a name, some small print, and a body that must not be
 * allowed to run away.
 *
 * Having it once is the difference between a panel and a set of pages that
 * happen to share a stylesheet.
 */
export function ListRow({ tone, pulse, title, meta, detail, mono, clamp = 0, onClick, edge, className, }) {
    const Tag = onClick ? "button" : "div";
    return (_jsxs(Tag, { ...(onClick ? { type: "button", onClick } : {}), className: cn("ui-row", tone && edge && `ui-row--${tone}`, onClick && "ui-row--button", className), children: [tone && _jsx(StatusDot, { tone: tone, pulse: pulse, className: "ui-row-dot" }), _jsxs("span", { className: "ui-row-body", children: [_jsxs("span", { className: "ui-row-head", children: [_jsx("span", { className: "ui-row-title", children: title }), meta != null && _jsx("span", { className: "ui-row-meta", children: meta })] }), detail != null && (_jsx("span", { className: cn("ui-row-detail", mono && "ui-row-detail--mono", clamp > 0 && "is-clamped"), style: clamp > 0 ? ({ ["--ui-row-clamp"]: clamp }) : undefined, children: detail }))] })] }));
}
/** The list they sit in. Separate so a caller cannot forget the spacing. */
export function ListRows({ children, className }) {
    return _jsx("div", { className: cn("ui-rows", className), children: children });
}
