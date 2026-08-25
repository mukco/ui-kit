import { useState, type ReactNode } from "react"

interface Props {
  /** The help content. Keep it one or two short sentences. */
  children: ReactNode
}

/** A small "?" that reveals help text on hover or keyboard focus. */
export function HelpTip({ children }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <span className="ui-helptip">
      <button
        type="button"
        aria-label="Help"
        className="ui-helptip-btn"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {(open || undefined) && <span className="ui-helptip-bubble">{children}</span>}
    </span>
  )
}
