import type { ReactNode } from "react";
import { type Severity } from "./Status";
export interface TriageItem {
    id: string;
    severity: Severity;
    title: ReactNode;
    /** Why, in a sentence. The thing that saves opening another page. */
    detail?: ReactNode;
    /** ISO 8601. Rendered as an age, because "3h ago" is the useful form. */
    at?: string | null;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}
/**
 * Everything wrong, in one place, worst first.
 *
 * The point is that it is *one* list. The same facts scattered across a dozen
 * cards mean going to look for them, which is the thing nobody does until
 * something has already broken — so a dashboard whose top answers "is anything
 * wrong" is worth more than one that merely contains the answer somewhere.
 *
 * Sorted here rather than by the caller: a triage list sorted any other way is
 * not a triage list, so it is not an option worth offering.
 */
export declare function TriageList({ items, emptyLabel, className, }: {
    items: TriageItem[];
    emptyLabel?: ReactNode;
    className?: string;
}): import("react").JSX.Element;
