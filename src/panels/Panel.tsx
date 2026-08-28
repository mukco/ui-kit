import type { ReactNode } from "react"
import { cn } from "../cn"
import { SectionLabel } from "../primitives/SectionLabel"
import { sportsIdentity } from "../sports/config"

/**
 * The dashboard panel, its rows, and the two-column split.
 *
 * These existed twice — `.bb-fav-panel`/`.fb-fav-panel`,
 * `.bb-fav-game-row`/`.fb-resultrow`, `.bb-fav-prow`/`.fb-statrankrow`,
 * `.bb-fav-games`/`.fb-recentupcoming-grid` — as two sets of CSS classes with
 * the same job and different values. Which is why one app had row dividers and
 * the other did not, and why fixing that in one place never fixed it in the
 * other. There is one set now and neither app defines these rules.
 */

export function Panel({
  label,
  action,
  /** Fixed height so a row of panels lines up. `null` grows to fit. */
  height = 220,
  /** Wrap the children in the scrolling region. Off when the panel splits. */
  scroll = true,
  children,
  className,
}: {
  label?: ReactNode
  action?: ReactNode
  height?: number | string | null
  scroll?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("ui-card ui-panel", className)}
      style={height != null ? { height } : undefined}
    >
      {label != null && <SectionLabel action={action}>{label}</SectionLabel>}
      {scroll ? <div className="ui-panel-scroll">{children}</div> : children}
    </div>
  )
}

/**
 * One row in a panel: a divider under it, none under the last. An `href` makes
 * the whole row the click target, with the app's own link so it does not
 * reload the page.
 */
export function PanelRow({
  href,
  /** Stack the children instead of laying them in a line — a row that carries a
      bar or a second line under its content. A prop, so a caller never reaches
      for its own layout class on a shared row. */
  stack = false,
  children,
  className,
}: {
  href?: string | null
  stack?: boolean
  children: ReactNode
  className?: string
}) {
  const cls = cn("ui-panelrow", stack && "ui-panelrow--stack", href && "ui-panelrow--link", className)
  if (!href) return <div className={cls}>{children}</div>
  const identity = sportsIdentity()
  return identity.link ? (
    identity.link({ href, className: cls, children })
  ) : (
    <a className={cls} href={href}>
      {children}
    </a>
  )
}

/**
 * Two labelled lists side by side with a rule between them — Recent and
 * Upcoming. The rule is the whole reason it reads as two panels rather than one
 * undivided block. Put it in a Panel with scroll={false}; each side scrolls on
 * its own.
 */
export function PanelSplit({
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  leftLabel: ReactNode
  rightLabel: ReactNode
  left: ReactNode
  right: ReactNode
}) {
  return (
    <div className="ui-panel-split">
      <div className="ui-panel-col">
        <SectionLabel>{leftLabel}</SectionLabel>
        <div className="ui-panel-scroll">{left}</div>
      </div>
      <div className="ui-panel-col ui-panel-col--right">
        <SectionLabel>{rightLabel}</SectionLabel>
        <div className="ui-panel-scroll">{right}</div>
      </div>
    </div>
  )
}

/** The italic grey line a panel shows when it has nothing to list. */
export function PanelEmpty({ children }: { children: ReactNode }) {
  return <p className="ui-panel-empty">{children}</p>
}
