import { type ReactElement } from "react";
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
    /**
     * Name used to resolve a missing id, when it differs from the displayed one —
     * a row that shows an abbreviation but should still resolve the full name.
     */
    resolveName?: string | null;
    className?: string;
    imageClassName?: string;
    textClassName?: string;
    /**
     * Stop the click reaching an enclosing clickable card. Player names sit
     * inside game tiles and table rows that are themselves links; without this
     * the row's navigation wins and you never reach the player.
     */
    stopPropagation?: boolean;
    /**
     * Wrap the rendered link — a hover card, a tooltip, a context menu. The kit
     * has no business knowing what an app shows on hover, but it should not force
     * the app to reimplement the link to get one.
     */
    wrap?: (link: ReactElement, id: PlayerId) => ReactElement;
    /**
     * Passed through to photoUrl. Baseball uses it to choose between MLB and
     * minor-league photo sets; another sport may not need it at all.
     */
    photoVariant?: string;
    /** Ring the avatar — a player whose game is in progress. */
    live?: boolean;
}
/**
 * Player identity line: headshot + name, linked to the player's page when the
 * app configured playerHref. With no id but a name, resolves once.
 *
 * Both consuming apps hand-rolled this before, and the differences that kept
 * them from adopting it were all extension points rather than behaviour: a
 * hover card, stopPropagation inside a clickable row, and a photo-set variant.
 * Those are `wrap`, `stopPropagation` and `photoVariant`. Resolution goes
 * through `resolvePlayer`, so an app that wants it cached supplies a cached
 * implementation rather than the kit growing a query library.
 */
export declare function PlayerLink({ player, size, avatarOnly, resolveName, className, imageClassName, textClassName, stopPropagation, wrap, photoVariant, live, }: Props): import("react").JSX.Element;
export {};
