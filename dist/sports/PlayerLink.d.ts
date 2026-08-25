import { type PlayerId } from "./config";
interface Props {
    /** The player. An id links; a name alone resolves via resolvePlayer if configured. */
    player: {
        id?: PlayerId | null;
        name?: string | null;
    };
    /** Photo size in px. */
    size?: number;
    /** Hide the name, avatar only. */
    avatarOnly?: boolean;
}
/**
 * Player identity line: headshot + name, linked to the player's page when the
 * app configured playerHref. With no id but a name, resolves once.
 */
export declare function PlayerLink({ player, size, avatarOnly }: Props): import("react").JSX.Element;
export {};
