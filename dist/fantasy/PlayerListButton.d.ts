import type { ReactNode } from "react";
/**
 * Put a player on one of your lists — baseball's list buttons (Watchlist,
 * Cut List, Trade), shared so every app watches a player the same way. Each
 * app used to have its own: baseball's eye, Hoops' star, football's star
 * (removed, 2026-09). An eye now, everywhere; the pixel eye under Phosphor.
 *
 * The kit draws the affordance; where the list lives (a server, Ottoneu, the
 * browser) is the app's business.
 */
export type PlayerList = "watch" | "cut" | "trade";
export interface PlayerListButtonProps {
    list?: PlayerList;
    on: boolean;
    onToggle: () => void;
    /** Saving to a remote list (Ottoneu) is under way. */
    pending?: boolean;
    /** Kept locally, but the remote copy did not take it. */
    failed?: boolean;
    disabled?: boolean;
    /** Tooltip when disabled ("Free agent — nothing to trade"). */
    disabledTitle?: string;
    /** md: beside a name in a page header; sm: in a table row. */
    size?: "sm" | "md";
    /** Show the word beside the icon ("Watch" / "Watching"). */
    labelled?: boolean;
    className?: string;
}
export declare function PlayerListButton({ list, on, onToggle, pending, failed, disabled, disabledTitle, size, labelled, className }: PlayerListButtonProps): import("react").JSX.Element;
/** The eye. */
export declare function WatchButton(props: Omit<PlayerListButtonProps, "list">): import("react").JSX.Element;
export interface WatchListRow {
    id: string | number;
    /** The app's PlayerLink. */
    player: ReactNode;
    /** Under the name: team · position, or why he is worth watching. */
    meta?: ReactNode;
    /** The right-hand cell: recent form, a salary, a status. */
    aside?: ReactNode;
}
/**
 * The players you are watching, as one list in every app: the player, a line
 * under him, a cell at the right, and the eye to let him go.
 */
export declare function WatchList({ rows, onRemove, empty, className }: {
    rows: WatchListRow[];
    onRemove: (id: string | number) => void;
    empty?: ReactNode;
    className?: string;
}): import("react").JSX.Element;
