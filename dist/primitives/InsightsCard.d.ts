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
    loading?: boolean;
    /** True while a background revalidation is in flight (stale content still visible). */
    isRefreshing?: boolean;
    /** The upstream response was served from cache. */
    cached?: boolean;
    /** ISO timestamp when the cached answer was generated. */
    generatedAt?: string | null;
    /**
     * Which model produced this, e.g. "gpt-5-nano-2025-08-07". Shown beside the
     * cache stamp.
     *
     * AI text is not like other content: two panels can look identical and be
     * the work of different models, and when an answer is wrong the first useful
     * question is which model wrote it. Both apps' backends already return this
     * — one of them was showing it and the other was not, which is exactly the
     * kind of thing that should not be a per-app decision.
     */
    model?: string | null;
    /** Optional line under the title explaining what this card covers. */
    description?: ReactNode;
    /** Render each section's bullets as a numbered list with chip badges instead of a plain bulleted list. */
    numbered?: boolean;
    /** Regeneration callback; omit the button entirely when absent. */
    onRegenerate?: () => void;
    sections: InsightSection[];
    empty?: ReactNode;
    className?: string;
}
/**
 * Card for AI-generated text: titled sections of bullets, a cached chip, and
 * a regenerate control. Data fetching stays in the app — pass results in.
 */
export declare function InsightsCard({ title, loading, isRefreshing, cached, generatedAt, model, description, numbered, onRegenerate, sections, empty, className, }: Props): import("react").JSX.Element;
export {};
