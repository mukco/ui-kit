import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DateNav for a schedule that steps by something other than a day — a
 * league's weeks, a tournament's rounds. ‹ prev · label (a picker over it) · next ›,
 * drawn with DateNav's own classes so the two read as one control.
 *
 * The picker is an invisible <select> laid over the label: unlike a date
 * input, a select opens on a click to itself, so it takes the tap directly.
 */
export function PeriodNav({ periods, value, onChange, current, currentLabel = "Now", noun = "period" }) {
    const idx = periods.findIndex((p) => p.id === value);
    const prev = idx > 0 ? periods[idx - 1] : null;
    const next = idx >= 0 && idx < periods.length - 1 ? periods[idx + 1] : null;
    const away = current != null && current !== value && periods.some((p) => p.id === current);
    return (_jsxs("div", { className: "ui-datenav", children: [_jsx("button", { type: "button", onClick: () => prev && onChange(prev.id), disabled: !prev, className: "ui-datenav-btn", "aria-label": `Previous ${noun}`, children: "\u2039" }), _jsxs("div", { className: "ui-datenav-mid", children: [_jsxs("span", { className: "ui-datenav-dateline", children: [_jsx("span", { className: "ui-datenav-date", children: periods[idx]?.label ?? "—" }), _jsx("svg", { className: "ui-datenav-cal", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" }) }), _jsx("select", { value: idx >= 0 ? periods[idx].id : "", onChange: (e) => onChange(e.target.value), className: "ui-periodnav-picker", "aria-label": `Choose ${noun}`, children: periods.map((p) => _jsx("option", { value: p.id, children: p.label }, p.id)) })] }), away && (_jsxs("button", { type: "button", onClick: () => onChange(current), className: "ui-datenav-today", children: ["\u27F2 ", currentLabel] }))] }), _jsx("button", { type: "button", onClick: () => next && onChange(next.id), disabled: !next, className: "ui-datenav-btn ui-datenav-btn--next", "aria-label": `Next ${noun}`, children: "\u203A" })] }));
}
