interface Props {
    /** Absent or null → the fallback renders. A row whose team could not be
        resolved is a normal state, not a caller error. */
    teamId?: string | number | null;
    /** Rendered size in px. */
    size?: number;
    /** Used for the initials fallback when there is no crest to show. */
    name?: string | null;
    /**
     * Colour for the fallback badge — a team's own colour rather than the
     * neutral grey. Two apps kept a local component solely for this: a crest
     * that fails to load is still a team, and a row of identical grey circles
     * loses which team is which.
     */
    tint?: string | null;
}
/** A team's crest from the app-configured logoUrl, with an initials fallback. */
export declare function TeamIcon({ teamId, size, name, tint }: Props): import("react").JSX.Element;
export {};
