import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { TeamIcon } from "./TeamIcon";
/**
 * The market, as three boxes: moneyline, total, spread.
 *
 * This is baseball's odds block, promoted. It was collapsed into a single line
 * of text when the picks card was extracted — "ML -129/+120 · CLE -1.5 · O/U
 * 7.5" — which lost the book, lost the over/under juice, and lost the crests.
 * A pick is an argument about these numbers; showing fewer of them to make the
 * card tidier is the wrong trade.
 *
 * Every box is optional: a sport whose feed only gives a spread string renders
 * the one box it can fill rather than three empty ones.
 */
export function OddsGrid({ odds, className }) {
    if (!odds)
        return null;
    const { away, home, total, overOdds, underOdds, provider } = odds;
    const hasMoneyline = away?.moneyline != null || home?.moneyline != null;
    const hasSpread = away?.spread != null || home?.spread != null;
    const hasTotal = total != null;
    if (!hasMoneyline && !hasSpread && !hasTotal)
        return null;
    const price = (v) => {
        if (v == null || v === "")
            return "—";
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? `+${n}` : String(v);
    };
    const sideRow = (side, field) => side == null ? null : (_jsxs("div", { className: "ui-odds-row", children: [_jsxs("span", { className: "ui-odds-team", children: [_jsx(TeamIcon, { teamId: side.teamId ?? null, size: 12, name: side.abbr ?? null }), side.abbr] }), _jsx("span", { className: "ui-odds-val", children: price(side[field]) })] }));
    return (_jsxs("div", { className: cn("ui-odds-grid", className), children: [hasMoneyline && (_jsxs("div", { className: "ui-odds", children: [_jsx("div", { className: "ui-odds-label", children: "Moneyline" }), sideRow(home, "moneyline"), sideRow(away, "moneyline"), provider && _jsx("div", { className: "ui-odds-prov", children: provider })] })), hasTotal && (_jsxs("div", { className: "ui-odds", children: [_jsx("div", { className: "ui-odds-label", children: "Total" }), _jsx("div", { className: "ui-odds-total", children: total }), (overOdds != null || underOdds != null) && (_jsxs("div", { className: "ui-odds-ou", children: [_jsxs("span", { children: ["O ", price(overOdds)] }), _jsxs("span", { children: ["U ", price(underOdds)] })] })), provider && _jsx("div", { className: "ui-odds-prov", children: provider })] })), hasSpread && (_jsxs("div", { className: "ui-odds", children: [_jsx("div", { className: "ui-odds-label", children: "Spread" }), sideRow(home, "spread"), sideRow(away, "spread"), provider && _jsx("div", { className: "ui-odds-prov", children: provider })] }))] }));
}
