import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/**
 * Card for AI-generated text: titled sections of bullets, a cached chip, and
 * a regenerate control. Data fetching stays in the app — pass results in.
 */
export function InsightsCard({ title = "AI Insights", loading = false, isRefreshing = false, cached = false, generatedAt, onRegenerate, sections, empty = "Nothing yet.", className, }) {
    const hasContent = sections.some((s) => s.bullets.length > 0);
    const showSkeleton = loading && !hasContent;
    const showContent = !showSkeleton && hasContent;
    const generatedLabel = generatedAt ? new Date(generatedAt).toLocaleString() : null;
    return (_jsxs("div", { className: cn("ui-card ui-insights", className), children: [_jsxs("div", { className: "ui-insights-head", children: [_jsx("h2", { className: "ui-insights-title", children: title }), _jsxs("div", { className: "ui-insights-controls", children: [cached && _jsx("span", { className: "ui-insights-cached", children: "Cached" }), isRefreshing && hasContent && _jsx("span", { className: "ui-insights-cached", children: "\u00B7 Updating\u2026" }), generatedAt && _jsxs("span", { className: "ui-insights-generated", title: generatedAt, children: ["\u00B7 ", generatedLabel] }), onRegenerate && (_jsx("button", { type: "button", className: "ui-insights-regen", disabled: loading || isRefreshing, onClick: onRegenerate, children: loading || isRefreshing ? "Generating…" : "Regenerate" }))] })] }), showSkeleton && (_jsxs("div", { className: "ui-insights-body", children: [_jsx("span", { className: "ui-skeleton", style: { width: "85%" } }), _jsx("span", { className: "ui-skeleton", style: { width: "70%" } }), _jsx("span", { className: "ui-skeleton", style: { width: "78%" } })] })), isRefreshing && hasContent && (_jsx("p", { className: "ui-insights-note", children: "Refreshing live data\u2026 showing last good insights." })), !showSkeleton && !hasContent && _jsx("p", { className: "ui-insights-empty", children: empty }), showContent &&
                sections.map((s, i) => s.bullets.length > 0 && (_jsxs("section", { className: "ui-insights-body", children: [s.heading && _jsx("h3", { className: "ui-insights-heading", children: s.heading }), _jsx("ul", { className: "ui-insights-bullets", children: s.bullets.map((b, j) => (_jsx("li", { children: b }, j))) })] }, i)))] }));
}
