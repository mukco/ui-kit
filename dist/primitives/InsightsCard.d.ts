import type { ReactNode } from "react";
export interface InsightSection {
    heading?: string;
    bullets: ReactNode[];
}
interface Props {
    title?: string;
    loading?: boolean;
    /** The upstream response was served from cache. */
    cached?: boolean;
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
export declare function InsightsCard({ title, loading, cached, onRegenerate, sections, empty, className, }: Props): import("react").JSX.Element;
export {};
