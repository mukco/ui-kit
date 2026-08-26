import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "../cn"
import { Drawer } from "./Drawer"

export interface NavChild {
  label: string
  href?: string
  onClick?: () => void
}

export interface NavItem {
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  /** When present the item renders as a dropdown of these entries. */
  children?: NavChild[]
}

interface Props {
  brand?: ReactNode
  /**
   * Where the brand goes when pressed. Supply one — a logo that does nothing
   * is a broken affordance: it looks like the way home, every other site has
   * trained people that it is, and pressing it doing nothing reads as the app
   * being stuck rather than as the logo being decorative.
   */
  onBrandClick?: () => void
  brandHref?: string
  items: NavItem[]
  /** Right-aligned cluster: search, icons, avatar. */
  right?: ReactNode
  /**
   * The bottom of the mobile drawer, below a divider: sign-out, a theme
   * control, a link to settings — the things that are about the session
   * rather than about where you are in the app.
   *
   * They belong here rather than in the top bar. A phone's bar has room for a
   * hamburger, a brand and two icons, and every session control added to it
   * takes width from the app's own name. The drawer is already open when
   * somebody is looking for "sign out", and it has room to group them.
   */
  drawerFooter?: ReactNode
  className?: string
}

/**
 * Top navigation: plain links and click-open dropdowns on desktop; a
 * hamburger that slides a drawer in from the left on phones (under 640px,
 * CSS-driven). The app supplies hrefs/onClicks — routing stays app-side.
 */
export function NavBar({ brand, onBrandClick, brandHref, items, right, drawerFooter, className }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  function activate(item: NavItem) {
    if (item.children) {
      setOpenMenu((cur) => (cur === item.label ? null : item.label))
    } else {
      setOpenMenu(null)
      item.onClick?.()
    }
  }

  function childActivate(child: NavChild) {
    setOpenMenu(null)
    setMobileOpen(false)
    child.onClick?.()
  }

  return (
    <nav ref={rootRef} className={cn("ui-nav", className)}>
      <div className="ui-nav-left">
        <button type="button" className="ui-nav-burger" aria-label="Open navigation menu" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
        {brand &&
          (brandHref ? (
            <a className="ui-nav-brand ui-nav-brand--link" href={brandHref}>
              {brand}
            </a>
          ) : onBrandClick ? (
            <button type="button" className="ui-nav-brand ui-nav-brand--link" onClick={onBrandClick}>
              {brand}
            </button>
          ) : (
            <span className="ui-nav-brand">{brand}</span>
          ))}
        <div className="ui-nav-items">
          {items.map((item) =>
            item.children ? (
              <div key={item.label} className="ui-nav-item-wrap">
                <button
                  type="button"
                  className={cn("ui-nav-item", openMenu === item.label && "ui-nav-item--open")}
                  aria-expanded={openMenu === item.label}
                  onClick={() => activate(item)}
                >
                  {item.label}
                </button>
                {openMenu === item.label && (
                  <div className="ui-nav-menu">
                    {item.children.map((child) =>
                      child.href ? (
                        <a key={child.label} className="ui-nav-entry" href={child.href} onClick={() => setOpenMenu(null)}>
                          {child.label}
                        </a>
                      ) : (
                        <button key={child.label} type="button" className="ui-nav-entry" onClick={() => childActivate(child)}>
                          {child.label}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button key={item.label} type="button" className={cn("ui-nav-item", item.active && "ui-nav-item--active")} onClick={() => activate(item)}>
                {item.label}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="ui-nav-right">{right}</div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" label="Navigation">
        <div className="ui-nav-mobile">
          {/* A header, not a floating brand. The drawer covers the page, so it
              needs to say what it is and offer a way out that is not "guess
              that tapping the dimmed area closes it". */}
          <div className="ui-nav-mobile-head">
            {brand && <span className="ui-nav-brand ui-nav-brand--mobile">{brand}</span>}
            <button
              type="button"
              className="ui-nav-mobile-close"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>
          </div>
          {items.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <a
                  className={cn("ui-nav-mobile-link", item.active && "ui-nav-mobile-link--active")}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ) : item.onClick ? (
                /* The drawer ignored item.active entirely, so the one screen
                   you were actually on looked exactly like the six you were
                   not — a menu that will not say where you are. */
                <button
                  type="button"
                  className={cn("ui-nav-mobile-link", item.active && "ui-nav-mobile-link--active")}
                  aria-current={item.active ? "page" : undefined}
                  onClick={() => { setMobileOpen(false); item.onClick?.() }}
                >
                  {item.label}
                </button>
              ) : null}
              {item.children?.map((child) =>
                child.href ? (
                  <a key={child.label} className="ui-nav-mobile-sub" href={child.href} onClick={() => setMobileOpen(false)}>
                    {child.label}
                  </a>
                ) : (
                  <button key={child.label} type="button" className="ui-nav-mobile-sub" onClick={() => childActivate(child)}>
                    {child.label}
                  </button>
                ),
              )}
            </div>
          ))}
          {drawerFooter && <div className="ui-nav-mobile-foot">{drawerFooter}</div>}
        </div>
      </Drawer>
    </nav>
  )
}
