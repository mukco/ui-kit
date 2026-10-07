import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "pixelarticons/react";
const under = (pathname, m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`));
export function TabBar({ tabs, pathname, onNavigate, label = "Sections", more }) {
    const [open, setOpen] = useState(false);
    const here = (t) => t.match.some((m) => under(pathname, m));
    const inMore = !!more && !tabs.some(here) && more.items.some((i) => under(pathname, i.to));
    const track = useRef(null);
    useEffect(() => setOpen(false), [pathname]);
    // Keep the current tab in view: with more tabs than fit, the one you are
    // on could sit under the fade at the edge, or off it altogether.
    useEffect(() => {
        const el = track.current;
        const tab = el?.querySelector(".ph-tab--here");
        if (!el || !tab)
            return;
        const left = tab.offsetLeft - el.offsetLeft;
        if (left < el.scrollLeft || left + tab.offsetWidth > el.scrollLeft + el.clientWidth - 36) {
            el.scrollLeft = Math.max(0, left - (el.clientWidth - tab.offsetWidth) / 2);
        }
    }, [pathname]);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    let lastGroup;
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: "ph-tabbar", "aria-label": label, children: [_jsx("div", { className: "ph-tabbar-track", ref: track, children: tabs.map((t) => (_jsxs("button", { type: "button", className: `ph-tab${here(t) ? " ph-tab--here" : ""}`, "aria-current": here(t) ? "page" : undefined, onClick: () => onNavigate(t.to), children: [_jsx(t.Icon, { className: "ph-tab-icon", "aria-hidden": "true" }), _jsx("span", { children: t.label })] }, t.to))) }), more && (_jsxs("button", { type: "button", className: `ph-tab ph-tab--more${inMore || open ? " ph-tab--here" : ""}`, "aria-expanded": open, "aria-haspopup": "dialog", onClick: () => setOpen((v) => !v), children: [_jsx(MoreHorizontal, { className: "ph-tab-icon", "aria-hidden": "true" }), _jsx("span", { children: "More" })] }))] }), more && open && (_jsx("div", { className: "ph-more", onClick: () => setOpen(false), children: _jsxs("div", { className: "ph-more-sheet", role: "dialog", "aria-modal": "true", "aria-label": "More", onClick: (e) => e.stopPropagation(), children: [_jsx("ul", { className: "ph-more-list", children: more.items.map((i) => {
                                const head = i.group && i.group !== lastGroup ? i.group : null;
                                lastGroup = i.group;
                                return (_jsxs("li", { children: [head && _jsx("div", { className: "ph-more-group", children: head }), _jsx("button", { type: "button", className: `ph-more-item${under(pathname, i.to) ? " ph-more-item--here" : ""}`, onClick: () => { setOpen(false); onNavigate(i.to); }, children: i.label })] }, i.to));
                            }) }), more.footer && _jsx("div", { className: "ph-more-foot", children: more.footer })] }) }))] }));
}
