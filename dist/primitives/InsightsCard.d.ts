import type { ReactNode } from "react";
export interface InsightSection {
    heading?: string;
    bullets: ReactNode[];
    /**
     * Rendered under the section's bullets — the entities the section talks
     * about, as links. Baseball's game insights put a row of player links there
     * and that slot is the only reason its panel could not be this component.
     */
    footer?: ReactNode;
}
interface Props {
    title?: string;
    /**
     * The pill beside the title. This says the text below was written by a model,
     * which is the one thing a reader needs to know before reading it, so it is
     * on by default — every panel built from this component is an AI panel. Pass
     * null to drop it.
     */
    badge?: ReactNode | null;
    /** Rendered after the badge — a matchup, a date range, whatever names the subject. */
    headerExtra?: ReactNode;
    loading?: boolean;
    /** True while a background revalidation is in flight (stale content still visible). */
    isRefreshing?: boolean;
    /** The upstream response was served from cache. */
    cached?: boolean;
    /** ISO timestamp when the cached answer was generated. */
    generatedAt?: string | null;
    /**
     * Which model produced this, e.g. "gpt-5-nano-2025-08-07".
     *
     * AI text is not like other content: two panels can look identical and be
     * the work of different models, and when an answer is wrong the first useful
     * question is which model wrote it.
     */
    model?: string | null;
    /** Optional line under the title explaining what this card covers. */
    description?: ReactNode;
    /** Render each section's bullets as a numbered list with chip badges instead of a plain bulleted list. */
    numbered?: boolean;
    /**
     * "grid" gives every section its own bordered box, two across on a wide
     * screen. Sections of AI text are separately generated and separately
     * cached, and running them together in one column says the opposite — that
     * they are one answer. Use it wherever the sections are independent.
     */
    layout?: "stacked" | "grid";
    /** Regeneration callback; omit the button entirely when absent. */
    onRegenerate?: () => void;
    sections: InsightSection[];
    empty?: ReactNode;
    className?: string;
}
/**
 * Card for AI-generated text: a titled, badged header with the provenance of
 * the answer, then sections of bullets. Data fetching stays in the app.
 */
export declare function InsightsCard({ title, badge, headerExtra, loading, isRefreshing, cached, generatedAt, model, description, numbered, layout, onRegenerate, sections, empty, className, }: Props): import("react").JSX.Element;
export {};
