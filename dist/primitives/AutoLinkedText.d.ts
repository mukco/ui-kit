import { type ReactNode } from "react";
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
    /** Render the link for a resolved player (router Link, hover card…). */
    renderPlayerLink?: (name: string, id: string | number) => ReactNode;
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
export declare function AutoLinkedText({ text, players, renderPlayerLink, links, className, resolveFromProse, }: Props): import("react").JSX.Element;
export {};
