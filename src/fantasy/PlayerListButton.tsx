import type { ReactNode } from "react"
import { ArrowsHorizontal, Close, Cut, Eye } from "pixelarticons/react"
import { cn } from "../cn"
import { Skin } from "../primitives/Pixel"

/**
 * Put a player on one of your lists — baseball's list buttons (Watchlist,
 * Cut List, Trade), shared so every app watches a player the same way. Each
 * app used to have its own: baseball's eye, Hoops' star, football's star
 * (removed, 2026-09). An eye now, everywhere; the pixel eye under Phosphor.
 *
 * The kit draws the affordance; where the list lives (a server, Ottoneu, the
 * browser) is the app's business.
 */
export type PlayerList = "watch" | "cut" | "trade"

const META: Record<PlayerList, { label: string }> = {
  watch: { label: "Watchlist" },
  cut: { label: "Cut List" },
  trade: { label: "Trade" },
}

const line = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true }

function LineIcon({ list }: { list: PlayerList }) {
  if (list === "cut") return <svg {...line}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" /></svg>
  if (list === "trade") return <svg {...line}><path d="M16 3l4 4-4 4" /><path d="M20 7H4" /><path d="M8 21l-4-4 4-4" /><path d="M4 17h16" /></svg>
  return <svg {...line}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
}

const PX = { watch: Eye, cut: Cut, trade: ArrowsHorizontal }

export interface PlayerListButtonProps {
  list?: PlayerList
  on: boolean
  onToggle: () => void
  /** Saving to a remote list (Ottoneu) is under way. */
  pending?: boolean
  /** Kept locally, but the remote copy did not take it. */
  failed?: boolean
  disabled?: boolean
  /** Tooltip when disabled ("Free agent — nothing to trade"). */
  disabledTitle?: string
  /** md: beside a name in a page header; sm: in a table row. */
  size?: "sm" | "md"
  /** Show the word beside the icon ("Watch" / "Watching"). */
  labelled?: boolean
  className?: string
}

export function PlayerListButton({ list = "watch", on, onToggle, pending, failed, disabled, disabledTitle, size = "sm", labelled, className }: PlayerListButtonProps) {
  const name = META[list].label
  const title = disabled ? (disabledTitle ?? name) : failed ? `Saved here — the ${name} sync failed` : on ? `Remove from ${name}` : `Add to ${name}`
  const Px = PX[list]
  const word: ReactNode = labelled && list === "watch" ? (on ? "Watching" : "Watch") : labelled ? name : null
  return (
    <button
      type="button"
      className={cn(
        "ui-listbtn", `ui-listbtn--${list}`, size === "md" && "ui-listbtn--md", labelled && "ui-listbtn--labelled",
        on && "ui-listbtn--on", failed && "ui-listbtn--failed", pending && "ui-listbtn--pending", className,
      )}
      aria-pressed={on}
      aria-label={labelled ? undefined : title}
      title={title}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggle() }}
    >
      <Skin px={<Px className="px-icon ui-listbtn-icon" aria-hidden="true" />}><LineIcon list={list} /></Skin>
      {word && <span>{word}</span>}
    </button>
  )
}

/** The eye. */
export function WatchButton(props: Omit<PlayerListButtonProps, "list">) {
  return <PlayerListButton {...props} list="watch" />
}

export interface WatchListRow {
  id: string | number
  /** The app's PlayerLink. */
  player: ReactNode
  /** Under the name: team · position, or why he is worth watching. */
  meta?: ReactNode
  /** The right-hand cell: recent form, a salary, a status. */
  aside?: ReactNode
}

/**
 * The players you are watching, as one list in every app: the player, a line
 * under him, a cell at the right, and the eye to let him go.
 */
export function WatchList({ rows, onRemove, empty = "Nobody yet — tap the eye on a player to watch him.", className }: {
  rows: WatchListRow[]
  onRemove: (id: string | number) => void
  empty?: ReactNode
  className?: string
}) {
  if (rows.length === 0) return <p className={cn("ui-watchlist-empty", className)}>{empty}</p>
  return (
    <ul className={cn("ui-watchlist", className)}>
      {rows.map((r) => (
        <li key={r.id} className="ui-watchlist-row">
          <span className="ui-watchlist-who">
            <span className="ui-watchlist-player">{r.player}</span>
            {r.meta != null && <span className="ui-watchlist-meta">{r.meta}</span>}
          </span>
          {r.aside != null && <span className="ui-watchlist-aside">{r.aside}</span>}
          <button type="button" className="ui-watchlist-remove" onClick={() => onRemove(r.id)} aria-label="Stop watching" title="Stop watching">
            <Skin px={<Close className="px-icon" aria-hidden="true" />}>
              <svg {...line} width={14} height={14}><path d="M18 6 6 18M6 6l12 12" /></svg>
            </Skin>
          </button>
        </li>
      ))}
    </ul>
  )
}
