import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
import { PanelRow, PanelEmpty } from "../panels/Panel";
import { PlayerLink } from "./PlayerLink";
/**
 * Two ranked columns of players — who is hot and who is not.
 *
 * Baseball's favourite-team panel, which is the reason this shape exists: three
 * players climbing on the left, three falling on the right, each a face, a name
 * and one number. Football had the same information — it computes a season
 * average, a last-three average and the delta between them for every player —
 * and rendered it as one undifferentiated list, so the panel that answers "who
 * should I be worried about" answered nothing at a glance.
 *
 * The kit owns the shape and the row; each app decides what its columns rank on
 * and what a value reads as, because "hot" is OPS over 14 days in one sport and
 * PPR per game over three weeks in the other.
 */
export function PlayerLeaders({ columns, className }) {
    return (_jsx("div", { className: cn("ui-leaders", className), children: columns.map((col) => (_jsxs("div", { className: cn("ui-leaders-col", `ui-leaders-col--${col.tone ?? "neutral"}`), children: [_jsxs("div", { className: "ui-leaders-head", children: [col.icon != null && _jsx("span", { className: "ui-leaders-icon", children: col.icon }), _jsx("span", { children: col.label })] }), col.rows.length === 0 ? (_jsx(PanelEmpty, { children: col.empty ?? "No data" })) : (col.rows.map((row, i) => (_jsxs(PanelRow, { children: [_jsx(PlayerLink, { player: { id: row.id, name: row.name }, resolveName: row.resolveName, size: 24, photoSize: 72, stopPropagation: true, className: "ui-leaders-plink", textClassName: "ui-leaders-name" }), row.meta != null && _jsx("span", { className: "ui-leaders-meta", children: row.meta }), _jsx("span", { className: "ui-leaders-val", children: row.value ?? "—" })] }, row.id ?? i))))] }, col.label))) }));
}
