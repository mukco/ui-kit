interface Props {
    /** Absent or null → the fallback renders. A row whose team could not be
        resolved is a normal state, not a caller error. */
    teamId?: string | number | null;
    /** Rendered size in px. */
    size?: number;
    /** Used for the initials fallback when there is no crest to show. */
    name?: string | null;
}
/** A team's crest from the app-configured logoUrl, with an initials fallback. */
export declare function TeamIcon({ teamId, size, name }: Props): import("react").JSX.Element;
export {};
