export interface OddsSide {
    teamId?: string | number | null;
    abbr?: string | null;
    /** Moneyline price as the book states it: -129, +120. */
    moneyline?: string | number | null;
    /** Spread as the book states it for THIS side: -1.5, +1.5. */
    spread?: string | number | null;
}
export interface OddsData {
    away?: OddsSide | null;
    home?: OddsSide | null;
    total?: string | number | null;
    overOdds?: string | number | null;
    underOdds?: string | number | null;
    /** The book. Shown under each box, because a line without its book is a rumour. */
    provider?: string | null;
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
export declare function OddsGrid({ odds, className }: {
    odds?: OddsData | null;
    className?: string;
}): import("react").JSX.Element | null;
