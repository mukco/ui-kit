interface Props {
    teamId: string | number;
    name: string;
    size?: number;
}
/**
 * Team crest + name, linked when the app configured teamHref; plain text
 * otherwise.
 */
export declare function TeamLink({ teamId, name, size }: Props): import("react").JSX.Element;
export {};
