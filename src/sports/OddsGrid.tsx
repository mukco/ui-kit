import { cn } from "../cn"
import { TeamIcon } from "./TeamIcon"

export interface OddsSide {
  teamId?: string | number | null
  abbr?: string | null
  /** Moneyline price as the book states it: -129, +120. */
  moneyline?: string | number | null
  /** Spread as the book states it for THIS side: -1.5, +1.5. */
  spread?: string | number | null
}

export interface OddsData {
  away?: OddsSide | null
  home?: OddsSide | null
  total?: string | number | null
  overOdds?: string | number | null
  underOdds?: string | number | null
  /** The book. Shown under each box, because a line without its book is a rumour. */
  provider?: string | null
}

/**
 * The market, as three boxes: moneyline, total, spread.
 *
 * This is baseball's odds block, promoted. It was collapsed into a single line
 * of text when the picks card was extracted — "ML -129/+120 · CLE -1.5 · O/U
 * 7.5" — which lost the book, lost the over/under juice, and lost the crests.
 * A pick is an argument about these numbers; showing fewer of them to make the
 * card tidier is the wrong trade.
 *
 * Every box is optional: a sport whose feed only gives a spread string renders
 * the one box it can fill rather than three empty ones.
 */
export function OddsGrid({ odds, className }: { odds?: OddsData | null; className?: string }) {
  if (!odds) return null

  const { away, home, total, overOdds, underOdds, provider } = odds
  const hasMoneyline = away?.moneyline != null || home?.moneyline != null
  const hasSpread = away?.spread != null || home?.spread != null
  const hasTotal = total != null
  if (!hasMoneyline && !hasSpread && !hasTotal) return null

  const price = (v: unknown) => {
    if (v == null || v === "") return "—"
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? `+${n}` : String(v)
  }

  const sideRow = (side: OddsSide | null | undefined, field: "moneyline" | "spread") =>
    side == null ? null : (
      <div className="ui-odds-row">
        <span className="ui-odds-team">
          <TeamIcon teamId={side.teamId ?? null} size={12} name={side.abbr ?? null} />
          {side.abbr}
        </span>
        <span className="ui-odds-val">{price(side[field])}</span>
      </div>
    )

  return (
    <div className={cn("ui-odds-grid", className)}>
      {hasMoneyline && (
        <div className="ui-odds">
          <div className="ui-odds-label">Moneyline</div>
          {sideRow(home, "moneyline")}
          {sideRow(away, "moneyline")}
          {provider && <div className="ui-odds-prov">{provider}</div>}
        </div>
      )}

      {hasTotal && (
        <div className="ui-odds">
          <div className="ui-odds-label">Total</div>
          <div className="ui-odds-total">{total}</div>
          {(overOdds != null || underOdds != null) && (
            <div className="ui-odds-ou">
              <span>O {price(overOdds)}</span>
              <span>U {price(underOdds)}</span>
            </div>
          )}
          {provider && <div className="ui-odds-prov">{provider}</div>}
        </div>
      )}

      {hasSpread && (
        <div className="ui-odds">
          <div className="ui-odds-label">Spread</div>
          {sideRow(home, "spread")}
          {sideRow(away, "spread")}
          {provider && <div className="ui-odds-prov">{provider}</div>}
        </div>
      )}
    </div>
  )
}
