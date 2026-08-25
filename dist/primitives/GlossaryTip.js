import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
/** Portal-positioned "i" tooltip for ML concepts — survives scroll and
    overflow:hidden contexts that defeat ordinary CSS bubbles. */
export function GlossaryTip({ hint }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const id = useId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootRef = useRef(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerRef = useRef(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tooltipRef = useRef(null);
    function updatePosition() {
        const trigger = triggerRef.current;
        if (!trigger)
            return;
        const rect = trigger.getBoundingClientRect();
        const maxWidth = Math.min(300, window.innerWidth - 16);
        const half = maxWidth / 2;
        let left = rect.left + rect.width / 2;
        left = Math.max(8 + half, Math.min(window.innerWidth - 8 - half, left));
        const tooltipHeight = tooltipRef.current?.offsetHeight || 120;
        let top = rect.bottom + 8;
        if (top + tooltipHeight > window.innerHeight - 8)
            top = rect.top - tooltipHeight - 8;
        if (top < 8)
            top = 8;
        setPosition({ top, left, maxWidth });
    }
    useEffect(() => {
        if (!open)
            return;
        updatePosition();
        const rafId = window.requestAnimationFrame(updatePosition);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onPointerDown = (e) => {
            if (!rootRef.current?.contains(e.target) && !tooltipRef.current?.contains(e.target))
                setOpen(false);
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onKey = (e) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown);
        document.addEventListener("keydown", onKey);
        document.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.cancelAnimationFrame(rafId);
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);
    if (!hint)
        return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keepOpen = (target) => Boolean(rootRef.current?.contains(target) || tooltipRef.current?.contains(target));
    return (_jsxs("span", { ref: rootRef, className: "ui-helptip", onMouseEnter: () => setOpen(true), onMouseLeave: (e) => {
            if (!keepOpen(e.relatedTarget))
                setOpen(false);
        }, onFocus: () => setOpen(true), onBlur: (e) => {
            if (!rootRef.current?.contains(e.relatedTarget))
                setOpen(false);
        }, children: [_jsx("button", { ref: triggerRef, type: "button", "aria-label": `Explain ${hint.label}`, "aria-expanded": open, "aria-describedby": open ? id : undefined, className: "ui-tip-btn", onMouseDown: (e) => e.stopPropagation(), onClick: (e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }, children: "i" }), open &&
                createPortal(_jsxs("span", { ref: tooltipRef, id: id, role: "tooltip", className: "ui-tip-bubble", onMouseEnter: () => setOpen(true), onMouseLeave: (e) => {
                        if (!keepOpen(e.relatedTarget))
                            setOpen(false);
                    }, style: {
                        top: position?.top ?? 8,
                        left: position?.left ?? 8,
                        width: position?.maxWidth ?? 300,
                    }, children: [_jsx("span", { className: "ui-tip-label", children: hint.label }), _jsx("span", { className: "ui-tip-def", children: hint.definition }), hint.formula && _jsx("span", { className: "ui-tip-formula ui-mono", children: hint.formula }), hint.interpretation && _jsx("span", { className: "ui-tip-interp", children: hint.interpretation })] }), document.body)] }));
}
