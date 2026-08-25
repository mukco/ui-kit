import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
/**
 * Floating assistant: a launcher bubble that opens a small chat panel.
 * The kit renders the conversation and input; the app decides what sending
 * a message actually does.
 */
export function Assistant({ title = "Assistant", messages, busy = false, onSend, launcher = "✨", className }) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState("");
    function submit() {
        const text = draft.trim();
        if (!text || busy)
            return;
        onSend(text);
        setDraft("");
    }
    return (_jsxs("div", { className: cn("ui-assistant-root", className), children: [open && (_jsxs("div", { className: "ui-assistant-panel", children: [_jsxs("header", { className: "ui-assistant-head", children: [_jsx("span", { children: title }), _jsx("button", { type: "button", "aria-label": "Close assistant", className: "ui-assistant-close", onClick: () => setOpen(false), children: "\u00D7" })] }), _jsxs("div", { className: "ui-assistant-log", children: [messages.length === 0 && _jsx("p", { className: "ui-assistant-empty", children: "Ask anything." }), messages.map((m, i) => (_jsx("div", { className: `ui-msg ui-msg--${m.role}`, children: m.content }, i))), busy && (_jsx("div", { className: "ui-msg ui-msg--assistant", children: _jsx("span", { className: "ui-spinner", style: { width: 12, height: 12 } }) }))] }), _jsxs("footer", { className: "ui-assistant-inputrow", children: [_jsx("input", { className: "ui-assistant-input", value: draft, placeholder: "Type\u2026", onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && submit() }), _jsx("button", { type: "button", className: "ui-assistant-send", onClick: submit, disabled: busy, children: "Send" })] })] })), !open && (_jsx("button", { type: "button", className: "ui-assistant-fab", "aria-label": "Open assistant", onClick: () => setOpen(true), children: launcher }))] }));
}
