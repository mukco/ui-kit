import { useState, type ReactNode } from "react"
import { cn } from "../cn"
import { Tabs } from "../primitives/Tabs"

/**
 * A game's box score, for every sport: a tab per team, then that team's
 * sections — basketball's one table of starters and bench, football's
 * passing / rushing / receiving…, baseball's batters and pitchers. Each
 * section is a table: the player column stays put while the numbers scroll
 * sideways on a phone, and a section may end in the team's totals.
 *
 * Cells are whatever the sport hands in, keyed by column; a missing key is an
 * empty cell. The player cell is the app's own link (PlayerLink, a hover
 * card), and `note` sits beside it — a position, a role, a ★.
 */
export interface BoxColumn {
  key: string
  label: ReactNode
  /** The column the eye goes to first (PTS, H): bold. */
  strong?: boolean
  /** Secondary (shooting splits, MIN): muted. */
  muted?: boolean
}

export interface BoxRow {
  id: string | number
  player: ReactNode
  note?: ReactNode
  cells: Record<string, ReactNode>
  /** Greyed — did not play, scratched. */
  dim?: boolean
}

export interface BoxSection {
  /** Heads the player column: "Passing", "Batters". */
  title: string
  columns: BoxColumn[]
  /** Rows under the title; or several labelled groups sharing the columns
      (basketball's Starters and Bench), each with its own header row. */
  rows?: BoxRow[]
  groups?: Array<{ label: string; rows: BoxRow[] }>
  totals?: Record<string, ReactNode>
}

export interface BoxTeam {
  key: string
  /** The tab: "BKN". */
  label: string
  sections: BoxSection[]
  /** Under the tables — who did not play. */
  footnote?: ReactNode
}

export interface BoxScoreProps {
  teams: BoxTeam[]
  /** Which team's tab opens first; the first team otherwise. */
  initial?: string
  className?: string
}

function HeadRow({ label, columns }: { label: string; columns: BoxColumn[] }) {
  return (
    <tr>
      <th className="ui-th ui-boxscore-player">{label}</th>
      {columns.map((c) => <th key={c.key} className="ui-th ui-boxscore-num">{c.label}</th>)}
    </tr>
  )
}

function Row({ row, columns }: { row: BoxRow; columns: BoxColumn[] }) {
  return (
    <tr className={cn("ui-tr", row.dim && "ui-boxscore-row--dim")}>
      <td className="ui-td ui-boxscore-player">
        <span className="ui-boxscore-who">{row.player}{row.note != null && <span className="ui-boxscore-note">{row.note}</span>}</span>
      </td>
      {columns.map((c) => (
        <td key={c.key} className={cn("ui-td ui-boxscore-num", c.strong && "ui-boxscore-num--strong", c.muted && "ui-boxscore-num--muted")}>
          {row.cells[c.key] ?? ""}
        </td>
      ))}
    </tr>
  )
}

function Section({ section }: { section: BoxSection }) {
  const groups = section.groups ?? [{ label: section.title, rows: section.rows ?? [] }]
  if (!groups.some((g) => g.rows.length)) return null
  return (
    <div className="ui-tablescroll ui-boxscore-scroll">
      <table className="ui-table ui-boxscore-table">
        {groups.map((g) => (
          <tbody key={g.label}>
            <HeadRow label={g.label} columns={section.columns} />
            {g.rows.map((r) => <Row key={r.id} row={r} columns={section.columns} />)}
          </tbody>
        ))}
        {section.totals && (
          <tbody>
            <tr className="ui-tr ui-boxscore-totals">
              <td className="ui-td ui-boxscore-player">Team</td>
              {section.columns.map((c) => <td key={c.key} className="ui-td ui-boxscore-num">{section.totals?.[c.key] ?? ""}</td>)}
            </tr>
          </tbody>
        )}
      </table>
    </div>
  )
}

export function BoxScore({ teams, initial, className }: BoxScoreProps) {
  const [active, setActive] = useState(initial ?? teams[0]?.key)
  const team = teams.find((t) => t.key === active) ?? teams[0]
  if (!team) return null
  return (
    <div className={cn("ui-boxscore", className)}>
      {teams.length > 1 && <Tabs tabs={teams.map((t) => ({ id: t.key, label: t.label }))} active={team.key} onChange={setActive} />}
      {team.sections.map((s) => <Section key={s.title} section={s} />)}
      {team.footnote != null && <div className="ui-boxscore-foot">{team.footnote}</div>}
    </div>
  )
}
