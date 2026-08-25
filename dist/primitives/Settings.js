import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/** Accessible on/off switch. */
export function Toggle({ checked, onChange, label, disabled }) {
    return (_jsx("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label, disabled: disabled, className: cn("ui-toggle", checked && "ui-toggle--on"), onClick: () => onChange(!checked), children: _jsx("span", { className: "ui-toggle-knob" }) }));
}
/** One settings line: what it is, what it does, the control. */
export function SettingRow({ label, hint, children }) {
    return (_jsxs("div", { className: "ui-settingrow", children: [_jsxs("div", { className: "ui-settingrow-text", children: [_jsx("span", { className: "ui-settingrow-label", children: label }), hint && _jsx("span", { className: "ui-settingrow-hint", children: hint })] }), children] }));
}
export function TextField({ value, onChange, placeholder, type = "text" }) {
    return (_jsx("input", { className: "ui-field", type: type, value: value, placeholder: placeholder, onChange: (e) => onChange(e.target.value) }));
}
export function SelectField({ value, onChange, options }) {
    return (_jsx("select", { className: "ui-field ui-field--select", value: value, onChange: (e) => onChange(e.target.value), children: options?.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value))) }));
}
const CHIP_TONES = {
    ok: "var(--ok)",
    stale: "var(--warn)",
    muted: "var(--muted)",
    danger: "var(--danger)",
};
/** Small status badge: Live, Stale, Cached… */
export function Chip({ tone = "muted", children }) {
    const color = CHIP_TONES[tone];
    return (_jsx("span", { className: "ui-chipbadge", style: { color, background: `color-mix(in srgb, ${color} 12%, transparent)` }, children: children }));
}
