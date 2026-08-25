import type { ReactNode } from "react";
/**
 * How bad something is. Deliberately its own scale rather than ChipTone: a
 * chip says what a thing *is* ("Live", "Cached"), this says whether anybody
 * needs to do something about it, and the two only look alike by accident.
 *
 * Painted from --sev-*, never --stat-*. That ramp is a percentile scale where
 * elite is red; borrowing it here would paint a healthy service in the colour
 * of a broken one.
 */
export type Severity = "ok" | "warn" | "critical" | "unknown";
/** Rank for sorting: the worst thing first, because that is what a list of
    problems is for. */
export declare const SEVERITY_ORDER: Record<Severity, number>;
/**
 * A coloured dot, and a word for anybody who cannot see the colour. The word
 * is visually hidden rather than absent — colour alone is never the carrier.
 */
export declare function StatusDot({ tone, pulse, label, className, }: {
    tone?: Severity;
    /** A soft blink — the "something is happening" tell on a healthy thing. */
    pulse?: boolean;
    /** Overrides the default word read out to assistive technology. */
    label?: string;
    className?: string;
}): import("react").JSX.Element;
export interface StatusTileItem {
    id: string;
    name: ReactNode;
    tone: Severity;
    /** The one number worth showing at this size — a latency, a queue depth. */
    metric?: ReactNode;
    /** A second line, for the reason when the tone is not ok. */
    detail?: ReactNode;
    /** Rows for the sparkline; omit for a tile with no history yet. */
    series?: Array<Record<string, unknown>> | null;
    seriesKey?: string;
    onSelect?: (id: string) => void;
}
/**
 * The estate at a glance: one tile per thing, colour for state, one figure,
 * and the shape it has been making.
 *
 * A deliberately modest version of the wall-of-hexagons idea — that density is
 * for hundreds of hosts, and copying it for a dozen containers on one droplet
 * would be decoration rather than information.
 */
export declare function StatusGrid({ items, selected, className, }: {
    items: StatusTileItem[];
    selected?: string | null;
    className?: string;
}): import("react").JSX.Element;
