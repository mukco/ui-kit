import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";
import { Drawer } from "./Drawer";
/**
 * Top navigation: plain links and click-open dropdowns on desktop; a
 * hamburger that slides a drawer in from the left on phones (under 640px,
 * CSS-driven). The app supplies hrefs/onClicks — routing stays app-side.
 */
export function NavBar({ brand, items, right, className }) {
    const [openMenu, setOpenMenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const rootRef = useRef(null);
    useEffect(() => {
        const onDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target))
                setOpenMenu(null);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);
    function activate(item) {
        if (item.children) {
            setOpenMenu((cur) => (cur === item.label ? null : item.label));
        }
        else {
            setOpenMenu(null);
            item.onClick?.();
        }
    }
    function childActivate(child) {
        setOpenMenu(null);
        setMobileOpen(false);
        child.onClick?.();
    }
    return (_jsxs("nav", { ref: rootRef, className: cn("ui-nav", className), children: [_jsxs("div", { className: "ui-nav-left", children: [_jsx("button", { type: "button", className: "ui-nav-burger", "aria-label": "Open navigation menu", onClick: () => setMobileOpen(true), children: "\u2630" }), brand && _jsx("span", { className: "ui-nav-brand", children: brand }), _jsx("div", { className: "ui-nav-items", children: items.map((item) => item.children ? (_jsxs("div", { className: "ui-nav-item-wrap", children: [_jsx("button", { type: "button", className: cn("ui-nav-item", openMenu === item.label && "ui-nav-item--open"), "aria-expanded": openMenu === item.label, onClick: () => activate(item), children: item.label }), openMenu === item.label && (_jsx("div", { className: "ui-nav-menu", children: item.children.map((child) => child.href ? (_jsx("a", { className: "ui-nav-entry", href: child.href, onClick: () => setOpenMenu(null), children: child.label }, child.label)) : (_jsx("button", { type: "button", className: "ui-nav-entry", onClick: () => childActivate(child), children: child.label }, child.label))) }))] }, item.label)) : (_jsx("button", { type: "button", className: cn("ui-nav-item", item.active && "ui-nav-item--active"), onClick: () => activate(item), children: item.label }, item.label))) })] }), _jsx("div", { className: "ui-nav-right", children: right }), _jsx(Drawer, { open: mobileOpen, onClose: () => setMobileOpen(false), side: "left", label: "Navigation", children: _jsxs("div", { className: "ui-nav-mobile", children: [brand && _jsx("span", { className: "ui-nav-brand ui-nav-brand--mobile", children: brand }), items.map((item) => (_jsxs("div", { children: [item.href ? (_jsx("a", { className: "ui-nav-mobile-link", href: item.href, onClick: () => setMobileOpen(false), children: item.label })) : item.onClick ? (_jsx("button", { type: "button", className: "ui-nav-mobile-link", onClick: () => { setMobileOpen(false); item.onClick?.(); }, children: item.label })) : null, item.children?.map((child) => child.href ? (_jsx("a", { className: "ui-nav-mobile-sub", href: child.href, onClick: () => setMobileOpen(false), children: child.label }, child.label)) : (_jsx("button", { type: "button", className: "ui-nav-mobile-sub", onClick: () => childActivate(child), children: child.label }, child.label)))] }, item.label)))] }) })] }));
}
