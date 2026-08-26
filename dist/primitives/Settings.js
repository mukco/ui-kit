import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId } from "react";
import { cn } from "../cn";
/** Accessible on/off switch. */
export function Toggle({ checked, onChange, label, disabled }) {
    return (_jsx("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label, disabled: disabled, className: cn("ui-toggle", checked && "ui-toggle--on"), onClick: () => onChange(!checked), children: _jsx("span", { className: "ui-toggle-knob" }) }));
}
/** One settings line: what it is, what it does, the control. */
export function SettingRow({ label, hint, children }) {
    return (_jsxs("div", { className: "ui-settingrow", children: [_jsxs("div", { className: "ui-settingrow-text", children: [_jsx("span", { className: "ui-settingrow-label", children: label }), hint && _jsx("span", { className: "ui-settingrow-hint", children: hint })] }), children] }));
}
export function TextField({ value, onChange, placeholder, type = "text", error, id }) {
    const auto = useId();
    const fieldId = id ?? auto;
    const errorId = `${fieldId}-error`;
    return (_jsxs(_Fragment, { children: [_jsx("input", { id: fieldId, className: cn("ui-field", error && "ui-field--invalid"), type: type, value: value, placeholder: placeholder, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined, onChange: (e) => onChange(e.target.value) }), error && _jsx(FieldError, { id: errorId, children: error })] }));
}
export function SelectField({ value, onChange, options, error, id }) {
    const auto = useId();
    const fieldId = id ?? auto;
    const errorId = `${fieldId}-error`;
    return (_jsxs(_Fragment, { children: [_jsx("select", { id: fieldId, className: cn("ui-field ui-field--select", error && "ui-field--invalid"), value: value, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined, onChange: (e) => onChange(e.target.value), children: options?.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value))) }), error && _jsx(FieldError, { id: errorId, children: error })] }));
}
/**
 * The message under an invalid field.
 *
 * role="alert" because validation usually appears after the reader has moved
 * on — they submitted, or left the field — and a message that only exists
 * visually is one they will never learn about. The ⚠ is decorative; the text
 * carries it, and aria-describedby ties it to the field it is about.
 */
function FieldError({ id, children }) {
    return (_jsxs("p", { className: "ui-field-error", id: id, role: "alert", children: [_jsx("span", { "aria-hidden": "true", children: "\u26A0" }), " ", children] }));
}
const CHIP_TONES = {
    ok: "var(--ok)",
    stale: "var(--warn)",
    muted: "var(--muted)",
    danger: "var(--danger)",
};
/** Small status badge: Live, Stale, Cached… */
export function Chip({ tone = "muted", children, onClick, title, }) {
    /*
     * The component names the hue; the stylesheet decides how to render it.
     *
     * This used to set both halves inline: color: var(--ok) on a 12% wash of
     * var(--ok) — the same colour as text on a tint of itself, which measured
     * 3.6–4.3:1 and failed AA on every tab that shows a chip. It is the same
     * defect the estate panel's count badge had, and inline styles meant no
     * stylesheet could correct it.
     *
     * Passing the hue as a custom property lets ui.css darken the text in light
     * and lighten it in dark, which is the only way one tint can work in both.
     */
    const style = { ["--chip-hue"]: CHIP_TONES[tone] };
    if (onClick) {
        return (_jsx("button", { type: "button", className: "ui-chipbadge ui-chipbadge--button", style: style, onClick: onClick, title: title, children: children }));
    }
    return (_jsx("span", { className: "ui-chipbadge", style: style, title: title, children: children }));
}
