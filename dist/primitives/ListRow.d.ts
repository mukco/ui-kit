import type { ReactNode } from "react";
import { type Severity } from "./Status";
export interface ListRowProps {
    /** A dot at the title's baseline. Omit for a row that is not about health. */
    tone?: Severity;
    pulse?: boolean;
    /** The thing itself — a job class, a container, an error. */
    title: ReactNode;
    /** Small print on the title's line: a queue, an age, a pid. */
    meta?: ReactNode;
    /** The body. Clamped, because a backtrace is not a paragraph. */
    detail?: ReactNode;
    /** Render the detail in mono — a log line, an error, an image tag. */
    mono?: boolean;
    /** Lines the detail folds to. 0 leaves it alone. */
    clamp?: number;
    /** Makes the whole row a door. */
    onClick?: () => void;
    /** A coloured left edge, for rows that carry a severity of their own. */
    edge?: boolean;
    /** Content before the title/body — an avatar or icon. Centered on the whole
     * row, unlike the tone dot, which sits at the title's own baseline. */
    leading?: ReactNode;
    /** Content after the title/body — typically an action button. */
    trailing?: ReactNode;
    className?: string;
}
/**
 * One thing in a list of things.
 *
 * Estate had hand-rolled this four times over — failed jobs, running jobs,
 * worker processes and log-search hits — each with its own class names, its own
 * truncation rule and its own idea of how small the small print is. They are
 * the same row: a marker, a name, some small print, and a body that must not be
 * allowed to run away.
 *
 * Having it once is the difference between a panel and a set of pages that
 * happen to share a stylesheet.
 */
export declare function ListRow({ tone, pulse, title, meta, detail, mono, clamp, onClick, edge, leading, trailing, className, }: ListRowProps): import("react").JSX.Element;
/** The list they sit in. Separate so a caller cannot forget the spacing. */
export declare function ListRows({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
