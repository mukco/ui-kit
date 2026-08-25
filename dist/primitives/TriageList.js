import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { SEVERITY_ORDER, StatusDot } from "./Status";
function age(iso) {
    const then = Date.parse(iso);
    if (Number.isNaN(then))
        return null;
    const seconds = Math.round((Date.now() - then) / 1000);
    if (seconds < 90)
        return "just now";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    return hours < 48 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}
/**
 * Everything wrong, in one place, worst first.
 *
 * The point is that it is *one* list. The same facts scattered across a dozen
 * cards mean going to look for them, which is the thing nobody does until
 * something has already broken — so a dashboard whose top answers "is anything
 * wrong" is worth more than one that merely contains the answer somewhere.
 *
 * Sorted here rather than by the caller: a triage list sorted any other way is
 * not a triage list, so it is not an option worth offering.
 */
export function TriageList({ items, emptyLabel = "Nothing needs attention.", className, }) {
    const sorted = [...items].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    if (sorted.length === 0) {
        return (_jsxs("p", { className: cn("ui-triage-clear", className), children: [_jsx(StatusDot, { tone: "ok" }), " ", emptyLabel] }));
    }
    return (_jsx("ul", { className: cn("ui-triage", className), children: sorted.map((item) => {
            const when = item.at ? age(item.at) : null;
            return (_jsxs("li", { className: cn("ui-triage-row", `ui-triage-row--${item.severity}`), children: [_jsx(StatusDot, { tone: item.severity, className: "ui-triage-dot" }), _jsxs("span", { className: "ui-triage-body", children: [_jsx("span", { className: "ui-triage-title", children: item.title }), item.detail != null && _jsx("span", { className: "ui-triage-detail", children: item.detail })] }), when && _jsx("time", { className: "ui-triage-age", dateTime: item.at ?? undefined, children: when }), item.action &&
                        (item.action.href ? (_jsx("a", { className: "ui-triage-action", href: item.action.href, children: item.action.label })) : (_jsx("button", { type: "button", className: "ui-triage-action", onClick: item.action.onClick, children: item.action.label })))] }, item.id));
        }) }));
}
