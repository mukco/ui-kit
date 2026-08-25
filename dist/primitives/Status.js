import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { SparklineChart } from "../charts/SparklineChart";
/** Rank for sorting: the worst thing first, because that is what a list of
    problems is for. */
export const SEVERITY_ORDER = {
    critical: 0,
    warn: 1,
    unknown: 2,
    ok: 3,
};
const WORDS = {
    ok: "Healthy",
    warn: "Needs a look",
    critical: "Broken",
    unknown: "Not reporting",
};
/**
 * A coloured dot, and a word for anybody who cannot see the colour. The word
 * is visually hidden rather than absent — colour alone is never the carrier.
 */
export function StatusDot({ tone = "unknown", pulse, label, className, }) {
    return (_jsx("span", { className: cn("ui-dot", `ui-dot--${tone}`, pulse && "ui-dot--pulse", className), children: _jsx("span", { className: "ui-sr", children: label ?? WORDS[tone] }) }));
}
/**
 * The estate at a glance: one tile per thing, colour for state, one figure,
 * and the shape it has been making.
 *
 * A deliberately modest version of the wall-of-hexagons idea — that density is
 * for hundreds of hosts, and copying it for a dozen containers on one droplet
 * would be decoration rather than information.
 */
export function StatusGrid({ items, selected, className, }) {
    return (_jsx("div", { className: cn("ui-statusgrid", className), children: items.map((item) => {
            const Cell = item.onSelect ? "button" : "div";
            return (_jsxs(Cell, { ...(item.onSelect
                    ? { type: "button", onClick: () => item.onSelect?.(item.id) }
                    : {}), className: cn("ui-statustile", `ui-statustile--${item.tone}`, selected === item.id && "is-selected"), children: [_jsxs("span", { className: "ui-statustile-head", children: [_jsx(StatusDot, { tone: item.tone, pulse: item.tone === "ok" }), _jsx("span", { className: "ui-statustile-name", children: item.name })] }), item.metric != null && _jsx("span", { className: "ui-statustile-metric", children: item.metric }), item.detail != null && _jsx("span", { className: "ui-statustile-detail", children: item.detail }), item.series && item.series.length > 1 && (_jsx(SparklineChart, { data: item.series, valueKey: item.seriesKey ?? "value", width: 96, height: 22, color: "var(--sev-ok)" }))] }, item.id));
        }) }));
}
