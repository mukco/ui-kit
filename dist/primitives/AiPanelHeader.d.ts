import type { ReactNode } from "react";
export interface AiProvenance {
    /** The pill beside the title — says a model wrote what follows. */
    badge?: ReactNode | null;
    /** Rendered after the badge: a matchup, a date range, whatever names the subject. */
    headerExtra?: ReactNode;
    isRefreshing?: boolean;
    cached?: boolean;
    generatedAt?: string | null;
    model?: string | null;
}
/**
 * The header every AI panel wears: the title, the AI badge, how stale the
 * answer is, and which model wrote it.
 *
 * One component rather than one per panel. The insights card and the picks card
 * are different bodies with the same provenance, and the last time these were
 * written twice one of them rendered "· 8/27/2026, 11:07:59 PM" with a stray
 * separator and no model at all.
 */
export declare function AiPanelHeader({ title, badge, headerExtra, isRefreshing, hasContent, cached, generatedAt, model, action, }: AiProvenance & {
    title: ReactNode;
    hasContent?: boolean;
    action?: ReactNode;
}): import("react").JSX.Element;
