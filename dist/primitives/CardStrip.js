import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { cn } from "../cn";
/**
 * Horizontal strip of cards — team pages' scrolling rows. Native touch
 * scrolling on phones; on desktop you can click-drag, and a drag suppresses
 * the trailing click so dragging never opens a card.
 */
export function CardStrip({ children, className }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        let down = false;
        let startX = 0;
        let startLeft = 0;
        let moved = false;
        const onDown = (e) => {
            if (e.pointerType && e.pointerType !== "mouse")
                return; // touch/pen scroll natively
            if (e.button != null && e.button !== 0)
                return;
            down = true;
            moved = false;
            startX = e.pageX;
            startLeft = el.scrollLeft;
            el.classList.add("ui-strip--dragging");
        };
        const onMove = (e) => {
            if (!down)
                return;
            const dx = e.pageX - startX;
            if (Math.abs(dx) > 3)
                moved = true;
            el.scrollLeft = startLeft - dx;
        };
        const onUp = () => {
            down = false;
            el.classList.remove("ui-strip--dragging");
        };
        const onClickCapture = (e) => {
            if (moved) {
                e.preventDefault();
                e.stopPropagation();
                moved = false;
            }
        };
        el.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        el.addEventListener("click", onClickCapture, true);
        return () => {
            el.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            el.removeEventListener("click", onClickCapture, true);
        };
    }, []);
    return (_jsx("div", { ref: ref, className: cn("ui-strip", className), children: children.map((child, i) => (_jsx("div", { className: "ui-strip-cell", children: child }, i))) }));
}
