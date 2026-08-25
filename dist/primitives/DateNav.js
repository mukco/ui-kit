import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
function fmt(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// ‹ prev · date label + native picker + "back to today" · next ›
export function DateNav({ date, onChange, disableFuture = false }) {
    const [todayStr] = useState(() => fmt(new Date()));
    const isToday = date === todayStr;
    const atMax = disableFuture && isToday;
    const shift = (days) => {
        const d = new Date(`${date}T12:00:00`);
        d.setDate(d.getDate() + days);
        onChange(fmt(d));
    };
    return (_jsxs("div", { className: "ui-datenav", children: [_jsx("button", { type: "button", onClick: () => shift(-1), className: "ui-datenav-btn", "aria-label": "Previous day", children: "\u2039" }), _jsxs("div", { className: "ui-datenav-mid", children: [_jsx("span", { className: "ui-datenav-date", children: new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }), _jsx("input", { type: "date", value: date, max: disableFuture ? todayStr : undefined, onChange: (e) => e.target.value && onChange(e.target.value), className: "ui-datenav-picker" }), !isToday && (_jsx("button", { type: "button", onClick: () => onChange(todayStr), className: "ui-datenav-today", children: "\u27F2 Today" }))] }), _jsx("button", { type: "button", onClick: () => shift(1), disabled: atMax, className: "ui-datenav-btn ui-datenav-btn--next", style: { opacity: atMax ? 0.3 : undefined }, "aria-label": "Next day", children: "\u203A" })] }));
}
