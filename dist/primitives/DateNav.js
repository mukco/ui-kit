import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
function fmt(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// ‹ prev · date label + native picker + "back to today" · next ›
export function DateNav({ date, onChange, disableFuture = false }) {
    const [todayStr] = useState(() => fmt(new Date()));
    const isToday = date === todayStr;
    const atMax = disableFuture && isToday;
    const pickerRef = useRef(null);
    // Clicking a date input's *text* does not open the calendar in Chrome —
    // only its native indicator does, and ours is transparent. So an invisible
    // input laid over the date looked tappable and did nothing. showPicker() is
    // the supported way to open it from our own control; the input stays in the
    // DOM, unclickable, purely as the thing the popup anchors to.
    const openPicker = () => {
        const el = pickerRef.current;
        if (!el)
            return;
        if (typeof el.showPicker === "function") {
            try {
                el.showPicker();
                return;
            }
            catch {
                // showPicker() throws if it is not from a user gesture, or on browsers
                // that expose it but refuse for this input type. Fall through.
            }
        }
        el.focus();
        el.click();
    };
    const shift = (days) => {
        const d = new Date(`${date}T12:00:00`);
        d.setDate(d.getDate() + days);
        onChange(fmt(d));
    };
    return (_jsxs("div", { className: "ui-datenav", children: [_jsx("button", { type: "button", onClick: () => shift(-1), className: "ui-datenav-btn", "aria-label": "Previous day", children: "\u2039" }), _jsxs("div", { className: "ui-datenav-mid", children: [_jsxs("span", { className: "ui-datenav-dateline", children: [_jsxs("button", { type: "button", onClick: openPicker, className: "ui-datenav-datebtn", "aria-label": "Choose date", children: [_jsx("span", { className: "ui-datenav-date", children: new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }), _jsxs("svg", { className: "ui-datenav-cal", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }), _jsx("path", { strokeLinecap: "round", d: "M8 3v4M16 3v4M3 10h18" })] })] }), _jsx("input", { ref: pickerRef, type: "date", value: date, max: disableFuture ? todayStr : undefined, onChange: (e) => e.target.value && onChange(e.target.value), className: "ui-datenav-picker", tabIndex: -1, "aria-hidden": "true" })] }), !isToday && (_jsx("button", { type: "button", onClick: () => onChange(todayStr), className: "ui-datenav-today", children: "\u27F2 Today" }))] }), _jsx("button", { type: "button", onClick: () => shift(1), disabled: atMax, className: "ui-datenav-btn ui-datenav-btn--next", style: { opacity: atMax ? 0.3 : undefined }, "aria-label": "Next day", children: "\u203A" })] }));
}
