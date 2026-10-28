import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MoreHorizontal } from "pixelarticons/react";
import { fitTabs, moreSections, shownTabs } from "./tabFit";
const under = (pathname, m) => (m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(`${m}/`));
const same = (a, b) => !!a && a.room === b.room && a.gap === b.gap && a.moreWidth === b.moreWidth &&
    a.widths.length === b.widths.length && a.widths.every((w, i) => w === b.widths[i]);
export function TabBar({ tabs, pathname, onNavigate, label = "Sections", more, overflowHeading = "Sections" }) {
    const [open, setOpen] = useState(false);
    const [m, setM] = useState(null);
    const track = useRef(null);
    const ruler = useRef(null);
    // Every label at its natural width, measured off a hidden row of the same
    // frames, and the room the slots share.
    const measure = useCallback(() => {
        const t = track.current, r = ruler.current;
        if (!t || !r)
            return;
        const frames = [...r.children];
        const w = (el) => (el ? Math.ceil(el.getBoundingClientRect().width) : 0);
        const next = {
            widths: frames.slice(0, -1).map((el) => w(el)),
            moreWidth: w(frames[frames.length - 1]),
            room: Math.floor(t.clientWidth),
            gap: parseFloat(getComputedStyle(t).columnGap) || 0,
        };
        setM((prev) => (same(prev, next) ? prev : next));
    }, []);
    // The first render shows every tab; this re-fits before paint, so the bar
    // never flashes the unfitted row.
    useLayoutEffect(measure, [measure, tabs]);
    useEffect(() => {
        // The bar's room (window, the skin showing the bar) and the ruler's size
        // (a late web font, the text-size setting) both re-fit.
        const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
        if (track.current)
            ro?.observe(track.current);
        if (ruler.current)
            ro?.observe(ruler.current);
        window.addEventListener("resize", measure);
        void document.fonts?.ready.then(measure);
        document.fonts?.addEventListener?.("loadingdone", measure);
        return () => {
            ro?.disconnect();
            window.removeEventListener("resize", measure);
            document.fonts?.removeEventListener?.("loadingdone", measure);
        };
    }, [measure]);
    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    const hereIdx = tabs.findIndex((t) => t.match.some((p) => under(pathname, p)));
    const extra = (more?.items ?? []).filter((i) => !tabs.some((t) => t.to === i.to));
    const alwaysMore = !!more;
    const count = m && m.widths.length === tabs.length ? fitTabs({ ...m, here: hereIdx, alwaysMore }) : tabs.length;
    const shownIdx = shownTabs(tabs.length, count, hereIdx);
    const overflow = tabs.filter((_, i) => !shownIdx.includes(i));
    const hasMore = alwaysMore || overflow.length > 0;
    const hereShown = shownIdx.includes(hereIdx);
    const moreActive = open || (!hereShown && (hereIdx >= 0 || extra.some((i) => under(pathname, i.to))));
    const sections = moreSections(overflow, more?.items ?? [], tabs, pathname, overflowHeading);
    const go = (to) => { setOpen(false); onNavigate(to); };
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: "ph-tabbar", "aria-label": label, children: [_jsxs("div", { className: "ph-tabbar-track", ref: track, children: [shownIdx.map((i) => {
                                const t = tabs[i];
                                const here = i === hereIdx;
                                return (_jsxs("button", { type: "button", className: `ph-tab${here && !open ? " ph-tab--here" : ""}`, "aria-current": here ? "page" : undefined, onClick: () => go(t.to), children: [_jsx(t.Icon, { className: "ph-tab-icon", "aria-hidden": "true" }), _jsx("span", { className: "ph-tab-label", children: t.label })] }, t.to));
                            }), hasMore && (_jsxs("button", { type: "button", className: `ph-tab ph-tab--more${moreActive ? " ph-tab--here" : ""}`, "aria-expanded": open, "aria-haspopup": "dialog", onClick: () => setOpen((v) => !v), children: [_jsx(MoreHorizontal, { className: "ph-tab-icon", "aria-hidden": "true" }), _jsx("span", { className: "ph-tab-label", children: "More" })] }))] }), _jsxs("div", { className: "ph-tabbar-ruler", ref: ruler, "aria-hidden": "true", children: [tabs.map((t) => (_jsxs("span", { className: "ph-tab", children: [_jsx(t.Icon, { className: "ph-tab-icon" }), _jsx("span", { className: "ph-tab-label", children: t.label })] }, t.to))), _jsxs("span", { className: "ph-tab", children: [_jsx(MoreHorizontal, { className: "ph-tab-icon" }), _jsx("span", { className: "ph-tab-label", children: "More" })] })] })] }), hasMore && open && (_jsx("div", { className: "ph-more", onClick: () => setOpen(false), children: _jsxs("div", { className: "ph-more-sheet", role: "dialog", "aria-modal": "true", "aria-label": "More", onClick: (e) => e.stopPropagation(), children: [sections.map((sec, n) => (_jsxs("div", { className: "ph-more-section", children: [sec.heading && _jsx("div", { className: "ph-more-group", children: sec.heading }), _jsx("ul", { className: "ph-more-list", children: sec.entries.map((i) => (_jsx("li", { children: _jsx("button", { type: "button", className: `ph-more-item${i.here ? " ph-more-item--here" : ""}`, "aria-current": i.here ? "page" : undefined, onClick: () => go(i.to), children: i.label }) }, i.to))) })] }, n))), more?.footer && _jsx("div", { className: "ph-more-foot", children: more.footer })] }) }))] }));
}
