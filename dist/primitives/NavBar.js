import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";
import { Drawer } from "./Drawer";
/**
 * Top navigation: plain links and click-open dropdowns on desktop; a
 * hamburger that slides a drawer in from the left on phones (under 640px,
 * CSS-driven). The app supplies hrefs/onClicks — routing stays app-side.
 */
export function NavBar({ brand, onBrandClick, brandHref, items, right, drawerFooter, className }) {
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
    return (_jsxs("nav", { ref: rootRef, className: cn("ui-nav", className), children: [_jsxs("div", { className: "ui-nav-left", children: [_jsx("button", { type: "button", className: "ui-nav-burger", "aria-label": "Open navigation menu", onClick: () => setMobileOpen(true), children: "\u2630" }), brand &&
                        (brandHref ? (_jsx("a", { className: "ui-nav-brand ui-nav-brand--link", href: brandHref, children: brand })) : onBrandClick ? (_jsx("button", { type: "button", className: "ui-nav-brand ui-nav-brand--link", onClick: onBrandClick, children: brand })) : (_jsx("span", { className: "ui-nav-brand", children: brand }))), _jsx("div", { className: "ui-nav-items", children: items.map((item) => item.children ? (_jsxs("div", { className: "ui-nav-item-wrap", children: [_jsx("button", { type: "button", className: cn("ui-nav-item", openMenu === item.label && "ui-nav-item--open"), "aria-expanded": openMenu === item.label, onClick: () => activate(item), children: item.label }), openMenu === item.label && (_jsx("div", { className: "ui-nav-menu", children: item.children.map((child) => child.href ? (_jsx("a", { className: "ui-nav-entry", href: child.href, onClick: () => setOpenMenu(null), children: child.label }, child.label)) : (_jsx("button", { type: "button", className: "ui-nav-entry", onClick: () => childActivate(child), children: child.label }, child.label))) }))] }, item.label)) : (_jsx("button", { type: "button", className: cn("ui-nav-item", item.active && "ui-nav-item--active"), onClick: () => activate(item), children: item.label }, item.label))) })] }), _jsx("div", { className: "ui-nav-right", children: right }), _jsx(Drawer, { open: mobileOpen, onClose: () => setMobileOpen(false), side: "left", label: "Navigation", children: _jsxs("div", { className: "ui-nav-mobile", children: [_jsxs("div", { className: "ui-nav-mobile-head", children: [brand && _jsx("span", { className: "ui-nav-brand ui-nav-brand--mobile", children: brand }), _jsx("button", { type: "button", className: "ui-nav-mobile-close", "aria-label": "Close navigation", onClick: () => setMobileOpen(false), children: "\u2715" })] }), items.map((item, i) => (_jsxs("div", { children: [item.section && item.section !== items[i - 1]?.section && (_jsx("p", { className: "ui-nav-mobile-section", children: item.section })), item.href ? (_jsxs("a", { className: cn("ui-nav-mobile-link", item.active && "ui-nav-mobile-link--active"), href: item.href, "aria-current": item.active ? "page" : undefined, onClick: () => setMobileOpen(false), children: [item.icon && _jsx("span", { className: "ui-nav-mobile-icon", "aria-hidden": "true", children: item.icon }), item.label] })) : item.onClick ? (_jsxs("button", { type: "button", className: cn("ui-nav-mobile-link", item.active && "ui-nav-mobile-link--active"), "aria-current": item.active ? "page" : undefined, onClick: () => { setMobileOpen(false); item.onClick?.(); }, children: [item.icon && _jsx("span", { className: "ui-nav-mobile-icon", "aria-hidden": "true", children: item.icon }), item.label] })) : null, item.children?.map((child) => child.href ? (_jsx("a", { className: "ui-nav-mobile-sub", href: child.href, onClick: () => setMobileOpen(false), children: child.label }, child.label)) : (_jsx("button", { type: "button", className: "ui-nav-mobile-sub", onClick: () => childActivate(child), children: child.label }, child.label)))] }, item.label))), drawerFooter && _jsx("div", { className: "ui-nav-mobile-foot", children: drawerFooter })] }) })] }));
}
