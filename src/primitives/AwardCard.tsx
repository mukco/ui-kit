import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  icon: ReactNode
  label: string
  /** The recipient — name, or anything renderable. */
  winner?: ReactNode
  detail?: ReactNode
  className?: string
}

/** An award: big icon, what it was for, who got it. Sport-neutral on purpose —
    season MVPs and trivia crowns are the same shape. */
export function AwardCard({ icon, label, winner, detail, className }: Props) {
  return (
    <div className={cn("ui-card ui-award", className)}>
      <span className="ui-award-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="ui-award-label">{label}</span>
      {winner != null && <span className="ui-award-winner">{winner}</span>}
      {detail != null && <span className="ui-award-detail">{detail}</span>}
    </div>
  )
}
