import { useState, type ReactNode, type MouseEvent } from "react"
import { cn } from "../cn"

/**
 * A player in a fantasy list — a roster, the wire, a matchup — the same
 * wherever he appears and in every app. Football's PlayerRow and baseball's
 * PlayerCard had each built this; this is that markup, once.
 *
 * One set of markup for two layouts. On a phone the identity line sits above
 * the actions and a sideways-scrolling metric strip; from 640px the wrappers
 * dissolve (display: contents) and everything lands on one line, the metric
 * cells aligned column-for-column down the list.
 *
 * The row owns the layout, the expand toggle and its carets; the app owns
 * what goes in each slot — its identity line, its platform's numbers (ESPN
 * projections, Ottoneu salary and PAR), its buttons, and the expanded body.
 */
export interface FantasyPlayerRowProps {
  /** Before the identity: the lineup slot (QB, FLEX, BN). */
  lead?: ReactNode
  /** Headshot, name, team, positions, status badges, a subline. */
  identity: ReactNode
  /** Small controls kept on the identity line even on a phone (Add, Claim). */
  trailing?: ReactNode
  /** Controls that take their own row on a phone (watch, compare, Cut, Bid). */
  actions?: ReactNode
  /** The metric cells — the app's own, so its numbers keep their formatting. */
  metrics?: ReactNode
  /** Opens a body under the row on click. */
  expandable?: boolean
  defaultExpanded?: boolean
  /** Controlled: the app keeps whether it is open — to fetch the body's
      data only once someone opens it. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The expanded body. */
  children?: ReactNode
  className?: string
}

const stop = (e: MouseEvent) => e.stopPropagation()

export function FantasyPlayerRow({ lead, identity, trailing, actions, metrics, expandable = false, defaultExpanded = false, open: openProp, onOpenChange, children, className }: FantasyPlayerRowProps) {
  const [ownOpen, setOwnOpen] = useState(defaultExpanded)
  const open = openProp ?? ownOpen
  const toggle = () => {
    const next = !open
    if (openProp === undefined) setOwnOpen(next)
    onOpenChange?.(next)
  }
  const caret = <span className="ui-fprow-caret" aria-hidden="true">{open ? "▲" : "▼"}</span>
  return (
    <div className={cn("ui-fprow", open && "ui-fprow--open", className)}>
      <div
        className={cn("ui-fprow-head", expandable && "ui-fprow-head--clickable")}
        onClick={expandable ? toggle : undefined}
        aria-expanded={expandable ? open : undefined}
      >
        <div className="ui-fprow-id">
          {lead != null && <span className="ui-fprow-lead" onClick={stop}>{lead}</span>}
          <div className="ui-fprow-who">{identity}</div>
          {trailing != null && <span className="ui-fprow-trailing" onClick={stop}>{trailing}</span>}
          {expandable && <span className="ui-fprow-caret-mobile">{caret}</span>}
        </div>
        {actions != null && <div className="ui-fprow-actions" onClick={stop}>{actions}</div>}
        {(metrics != null || expandable) && (
          <div className="ui-fprow-metrics">
            <div className="ui-fprow-metrics-inner">
              {metrics}
              {expandable && <span className="ui-fprow-caret-desktop">{caret}</span>}
            </div>
          </div>
        )}
      </div>
      {open && children != null && <div className="ui-fprow-body">{children}</div>}
    </div>
  )
}
