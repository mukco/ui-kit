interface Props {
    teamId: string | number;
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
