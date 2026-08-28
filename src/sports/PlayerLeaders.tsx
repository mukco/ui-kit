import type { ReactNode } from "react"
import { cn } from "../cn"
import { PanelRow, PanelEmpty } from "../panels/Panel"
import { PlayerLink } from "./PlayerLink"
import type { PlayerId } from "./config"

export interface LeaderRow {
  id?: PlayerId | null
  name?: string | null
  /** The small grey line under the name — a position, a team, a split. */
  meta?: ReactNode
  /** The number the column ranks on. A node, so a row can show a progression. */
  value?: ReactNode
  /** Name to resolve an absent id from; passed through to PlayerLink. */
  resolveName?: string | null
}

export interface LeaderColumn {
  label: string
  /** Sits before the label — an emoji or an Icon. */
  icon?: ReactNode
  /** Colours the heading and every value in the column. */
  tone?: "hot" | "cold" | "neutral"
  rows: LeaderRow[]
  empty?: string
}

/**
 * Two ranked columns of players — who is hot and who is not.
 *
 * Baseball's favourite-team panel, which is the reason this shape exists: three
 * players climbing on the left, three falling on the right, each a face, a name
 * and one number. Football had the same information — it computes a season
 * average, a last-three average and the delta between them for every player —
 * and rendered it as one undifferentiated list, so the panel that answers "who
 * should I be worried about" answered nothing at a glance.
 *
 * The kit owns the shape and the row; each app decides what its columns rank on
 * and what a value reads as, because "hot" is OPS over 14 days in one sport and
 * PPR per game over three weeks in the other.
 */
export function PlayerLeaders({ columns, className }: { columns: LeaderColumn[]; className?: string }) {
  return (
    <div className={cn("ui-leaders", className)}>
      {columns.map((col) => (
        <div key={col.label} className={cn("ui-leaders-col", `ui-leaders-col--${col.tone ?? "neutral"}`)}>
          <div className="ui-leaders-head">
            {col.icon != null && <span className="ui-leaders-icon">{col.icon}</span>}
            <span>{col.label}</span>
          </div>
          {col.rows.length === 0 ? (
            <PanelEmpty>{col.empty ?? "No data"}</PanelEmpty>
          ) : (
            col.rows.map((row, i) => (
              <PanelRow key={row.id ?? i}>
                <PlayerLink
                  player={{ id: row.id, name: row.name }}
                  resolveName={row.resolveName}
                  size={24}
                  photoSize={72}
                  stopPropagation
                  className="ui-leaders-plink"
                  textClassName="ui-leaders-name"
                />
                {row.meta != null && <span className="ui-leaders-meta">{row.meta}</span>}
                <span className="ui-leaders-val">{row.value ?? "—"}</span>
              </PanelRow>
            ))
          )}
        </div>
      ))}
    </div>
  )
}
