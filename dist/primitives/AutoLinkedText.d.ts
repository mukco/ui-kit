import { type ReactElement, type ReactNode } from "react";
import { type PlayerId } from "../sports/config";
export interface NamedLink {
    name: string;
    onClick?: () => void;
    href?: string;
}
interface Props {
    text: string;
    /** Closed set of names to link; deterministic — no guessing what's a name. */
    players?: Array<{
        name: string;
        id: string | number;
    }> | null;
    /**
     * Escape hatch for a caller whose linked player is genuinely not a player
     * link. Almost nothing should pass this: a name in AI prose renders as the
     * kit's PlayerLink — headshot, name, the app's own router link — and it used
     * to be REQUIRED, which is why each app supplied its own and one ended up
     * with a headshot and the other with a bare coloured word at a different
     * size. What a linked player looks like is not an app decision.
     */
    renderPlayerLink?: (name: string, id: string | number) => ReactNode;
    /**
     * Send a linked player somewhere other than the app's configured playerHref —
     * a simulation's player pages, say. The link still renders the same.
     */
    playerHref?: (id: PlayerId) => string;
    /** Wrap each player link — a hover card. Passed through to PlayerLink. */
    wrapPlayer?: (link: ReactElement, id: PlayerId) => ReactElement;
    /** Arbitrary named links (teams, tables…) keyed by exact name. */
    links?: NamedLink[];
    className?: string;
    /**
     * With no closed `players` set, pull candidate names out of the prose and
     * resolve them through the app's configured resolvePlayer. Off by default:
     * open-world guessing is strictly worse than membership in a known set, so a
     * caller that knows its players should pass them instead. Both apps needed
     * this for AI text where nothing knows the cast in advance.
     */
    resolveFromProse?: boolean;
}
/** AI-prose renderer: bolds numbers and turns known player/team names into
    links. Pass `players` (the entities already in scope) for deterministic
    linking; without it, only `links` apply. */
export declare function AutoLinkedText({ text, players, renderPlayerLink, playerHref, wrapPlayer, links, className, resolveFromProse, }: Props): import("react").JSX.Element;
export {};
