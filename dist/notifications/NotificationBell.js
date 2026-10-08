import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { IconBell, IconBellOff, IconClose } from "../primitives/Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../cn";
import { Button } from "../primitives/Button";
const ENGAGE = 10;
const DISMISS_AT = 0.4;
const FLICK_PX_PER_MS = 0.6;
const FLICK_MIN = 48;
const LEAVE_MS = 180;
const isToday = (iso) => {
    if (!iso)
        return false;
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};
const reducedMotion = () => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
/**
 * One notification: tap it to go to the thing, swipe it left to be rid of
 * it — Family Hub's row (2026-10-02), where the whole row is the handle the
 * way a phone's own list works. Delete dismisses the focused row.
 */
function Row({ item, onOpen, onDismiss, action, onAction }) {
    const [dx, setDx] = useState(0);
    const [phase, setPhase] = useState("rest");
    const [span, setSpan] = useState(0);
    const gesture = useRef(null);
    const swallow = useRef(false);
    const row = useRef(null);
    function leave() {
        if (!onDismiss || phase === "leaving")
            return;
        const li = row.current;
        if (!li || reducedMotion()) {
            onDismiss(item);
            return;
        }
        setPhase("leaving");
        setDx(-li.offsetWidth);
        li.style.height = `${li.offsetHeight}px`;
        window.setTimeout(() => {
            li.style.height = "0px";
            window.setTimeout(() => onDismiss(item), LEAVE_MS);
        }, LEAVE_MS);
    }
    function down(e) {
        if (!onDismiss || (e.pointerType === "mouse" && e.button !== 0) || phase === "leaving")
            return;
        gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, width: e.currentTarget.offsetWidth, mode: "pending" };
    }
    function move(e) {
        const g = gesture.current;
        if (!g || e.pointerId !== g.id)
            return;
        const across = e.clientX - g.x;
        const downBy = e.clientY - g.y;
        if (g.mode === "pending") {
            if (Math.abs(downBy) > ENGAGE && Math.abs(downBy) >= Math.abs(across)) {
                gesture.current = null;
                return;
            }
            if (Math.abs(across) <= ENGAGE)
                return;
            g.mode = "swipe";
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setSpan(g.width);
            setPhase("drag");
        }
        // Left is the only way it goes; right gives a little and springs back.
        setDx(across < 0 ? across : across * 0.15);
    }
    function up(e) {
        const g = gesture.current;
        gesture.current = null;
        if (!g || g.mode !== "swipe")
            return;
        swallow.current = true;
        const travelled = e.clientX - g.x;
        const speed = -travelled / Math.max(1, e.timeStamp - g.t);
        if (-travelled > g.width * DISMISS_AT || (-travelled > FLICK_MIN && speed > FLICK_PX_PER_MS))
            leave();
        else {
            setPhase("settle");
            setDx(0);
        }
    }
    function cancel() {
        gesture.current = null;
        if (phase === "drag") {
            setPhase("settle");
            setDx(0);
        }
    }
    function open() {
        if (swallow.current) {
            swallow.current = false;
            return;
        }
        onOpen(item);
    }
    function key(e) {
        if (!onDismiss || (e.key !== "Delete" && e.key !== "Backspace"))
            return;
        e.preventDefault();
        const next = row.current?.nextElementSibling?.querySelector(".ui-notif-open")
            ?? row.current?.previousElementSibling?.querySelector(".ui-notif-open");
        next?.focus();
        leave();
    }
    const armed = phase === "drag" && span > 0 && -dx > span * DISMISS_AT;
    const unread = item.unread !== false;
    const meta = item.source != null || item.time != null;
    return (_jsx("li", { ref: row, className: cn("ui-notif-row", unread && "is-unread", phase === "leaving" && "is-leaving"), children: _jsxs("div", { className: "ui-notif-track", children: [onDismiss && (_jsx("div", { className: cn("ui-notif-under", armed && "is-armed"), "aria-hidden": "true", style: { opacity: dx < 0 ? Math.min(1, -dx / 60) : 0 }, children: armed ? "Let go" : "Dismiss" })), _jsxs("div", { className: cn("ui-notif-face", `ui-notif-face--${phase}`), style: { transform: dx ? `translateX(${dx}px)` : undefined }, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: cancel, onTransitionEnd: () => { if (phase === "settle")
                        setPhase("rest"); }, children: [_jsxs("button", { type: "button", className: "ui-notif-open", onClick: open, onKeyDown: key, "aria-keyshortcuts": onDismiss ? "Delete" : undefined, children: [_jsx("span", { className: "ui-notif-dot", "aria-hidden": "true" }), item.icon && _jsx("span", { className: "ui-notif-icon", "aria-hidden": "true", children: item.icon }), _jsxs("span", { className: "ui-notif-text", children: [_jsx("span", { className: "ui-notif-title", children: item.title }), item.body && _jsx("span", { className: "ui-notif-body", children: item.body }), meta && (_jsxs("span", { className: "ui-notif-meta", children: [item.source != null && _jsx("span", { className: "ui-notif-source", children: item.source }), item.source != null && item.time != null && " · ", item.time] }))] })] }), action && (_jsx("button", { type: "button", className: "ui-notif-action", onClick: () => onAction(item), children: action.label }))] })] }) }));
}
/**
 * The bell, its count, and the sheet it opens — Family Hub's (2026-10-02),
 * shared by the sports apps. It was a small dropdown hung off the bell: on a
 * phone, tiny type and a corner ✕. Now on a phone it is a sheet the full width
 * of the screen from under the bar to the bottom, rows at the phone's type
 * scale, its actions real buttons at the top, and the list split into Today
 * and Earlier; a desktop keeps a popover under the bell. Drawn into <body>
 * so no bar's rules reach into it.
 */
export function NotificationBell({ items, onItemClick, onDismissAll, onMarkAllRead, onDismiss, action, settings, empty = "You're all caught up.", className }) {
    const [open, setOpen] = useState(false);
    // Where the bar ends: the sheet hangs from there, whatever height the
    // app's bar and the phone's notch make it.
    const [top, setTop] = useState(56);
    const bell = useRef(null);
    const sheet = useRef(null);
    const unread = items.filter((n) => n.unread !== false).length;
    const close = useCallback(() => {
        setOpen(false);
        bell.current?.focus({ preventScroll: true });
    }, []);
    // While open the sheet owns the touch: the page does not scroll behind it,
    // and Escape closes it.
    useEffect(() => {
        if (!open)
            return undefined;
        sheet.current?.querySelector(".ui-notif-heading")?.focus();
        const body = document.body;
        const was = { overflow: body.style.overflow, swiping: body.dataset.swiping };
        body.style.overflow = "hidden";
        body.dataset.swiping = "true";
        const onKey = (e) => { if (e.key === "Escape")
            close(); };
        document.addEventListener("keydown", onKey);
        return () => {
            body.style.overflow = was.overflow;
            if (was.swiping === undefined)
                delete body.dataset.swiping;
            else
                body.dataset.swiping = was.swiping;
            document.removeEventListener("keydown", onKey);
        };
    }, [open, close]);
    const openItem = (item) => { setOpen(false); onItemClick?.(item); };
    const runAction = (item) => { setOpen(false); action?.onClick(item); };
    const dated = items.some((n) => n.at);
    const groups = dated
        ? [{ label: "Today", rows: items.filter((n) => isToday(n.at)) }, { label: "Earlier", rows: items.filter((n) => !isToday(n.at)) }]
        : [{ label: null, rows: items }];
    return (_jsxs("div", { className: cn("ui-bell", className), children: [_jsxs("button", { ref: bell, type: "button", className: cn("ui-bell-btn", open && "is-open"), "aria-label": unread > 0 ? `Notifications, ${unread} unread` : "Notifications", "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => {
                    if (open) {
                        close();
                        return;
                    }
                    const bar = bell.current?.closest(".ui-nav") ?? bell.current;
                    setTop(Math.round(bar?.getBoundingClientRect().bottom ?? 56));
                    setOpen(true);
                }, children: [_jsx(IconBell, { className: "ui-bell-icon", size: 18 }), unread > 0 && _jsx("span", { className: "ui-bell-badge", children: unread > 9 ? "9+" : unread })] }), open && typeof document !== "undefined" && createPortal(_jsxs(_Fragment, { children: [_jsx("div", { className: "ui-notif-scrim", onClick: close, "aria-hidden": "true", style: { "--ui-notif-top": `${top}px` } }), _jsxs("section", { ref: sheet, className: "ui-notif-sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "ui-notif-heading", style: { "--ui-notif-top": `${top}px` }, children: [_jsxs("header", { className: "ui-notif-head", children: [_jsx("h2", { id: "ui-notif-heading", className: "ui-notif-heading", tabIndex: -1, children: "Notifications" }), unread > 0 && _jsxs("span", { className: "ui-notif-count", children: [unread, " unread"] }), _jsx("button", { type: "button", className: "ui-notif-close", onClick: close, "aria-label": "Close notifications", children: _jsx(IconClose, { size: 18 }) })] }), items.length > 0 && (onMarkAllRead || onDismissAll) && (_jsxs("div", { className: "ui-notif-tools", children: [onMarkAllRead && _jsx(Button, { size: "sm", onClick: onMarkAllRead, disabled: unread === 0, children: "Mark all read" }), onDismissAll && _jsx(Button, { size: "sm", onClick: onDismissAll, children: "Clear all" })] })), _jsx("div", { className: "ui-notif-scroll", children: items.length === 0 ? (_jsxs("div", { className: "ui-notif-empty", children: [_jsx(IconBellOff, { className: "ui-notif-empty-icon", size: 28 }), _jsx("p", { className: "ui-notif-empty-title", children: empty }), settings && (_jsx(Button, { size: "sm", onClick: () => { setOpen(false); settings.onClick(); }, children: settings.label ?? "Choose what you hear about" }))] })) : (groups.map((g) => g.rows.length > 0 && (_jsxs("section", { className: "ui-notif-group", "aria-label": g.label ?? undefined, children: [g.label && _jsx("h3", { className: "ui-notif-group-head", children: g.label }), _jsx("ul", { className: "ui-notif-list", children: g.rows.map((n) => (_jsx(Row, { item: n, onOpen: openItem, onDismiss: onDismiss, action: action, onAction: runAction }, n.id))) })] }, g.label ?? "all")))) })] })] }), document.body)] }));
}
