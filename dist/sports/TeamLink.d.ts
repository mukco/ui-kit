interface Props {
    /** Absent or null → the crest falls back to initials and nothing links.
        A roster row whose team could not be resolved is a normal state, not a
        caller error. */
    teamId?: string | number | null;
    name: string;
    size?: number;
    /** Applied to the name only — a table row that wants one team's name
        emphasized (the row's own team, say) without resizing its icon. */
    textClassName?: string;
}
/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export declare function TeamLink({ teamId, name, size, textClassName }: Props): import("react").JSX.Element;
export {};
