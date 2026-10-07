import { type ReactNode } from "react";
/**
 * A player in a fantasy list — a roster, the wire, a matchup — the same
 * wherever he appears and in every app. Football's PlayerRow and baseball's
 * PlayerCard had each built this; this is that markup, once.
 *
 * One set of markup for two layouts. On a phone the identity line sits above
 * the actions and a sideways-scrolling metric strip; from 640px the wrappers
 * dissolve (display: contents) and everything lands on one line, the metric
 * cells aligned column-for-column down the list.
 *
 * The row owns the layout, the expand toggle and its carets; the app owns
 * what goes in each slot — its identity line, its platform's numbers (ESPN
 * projections, Ottoneu salary and PAR), its buttons, and the expanded body.
 */
export interface FantasyPlayerRowProps {
    /** Before the identity: the lineup slot (QB, FLEX, BN). */
    lead?: ReactNode;
    /** Headshot, name, team, positions, status badges, a subline. */
    identity: ReactNode;
    /** Small controls kept on the identity line even on a phone (Add, Claim). */
    trailing?: ReactNode;
    /** Controls that take their own row on a phone (watch, compare, Cut, Bid). */
    actions?: ReactNode;
    /** The metric cells — the app's own, so its numbers keep their formatting. */
    metrics?: ReactNode;
    /** Opens a body under the row on click. */
    expandable?: boolean;
    defaultExpanded?: boolean;
    /** Controlled: the app keeps whether it is open — to fetch the body's
        data only once someone opens it. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** The expanded body. */
    children?: ReactNode;
    className?: string;
}
export declare function FantasyPlayerRow({ lead, identity, trailing, actions, metrics, expandable, defaultExpanded, open: openProp, onOpenChange, children, className }: FantasyPlayerRowProps): import("react").JSX.Element;
