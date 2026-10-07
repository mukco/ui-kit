interface Props {
    on: boolean;
    onToggle: () => void;
    /** Tooltip for each state, in the sport's words ("…each inning and the final"). */
    title: {
        on: string;
        off: string;
    };
}
/**
 * Follow a game: its start, periods and final reach this user's devices. One
 * line, bell and word together; the pixel bell under Phosphor. The app shows
 * it only where push is set up and the game isn't over.
 */
export declare function FollowButton({ on, onToggle, title }: Props): import("react").JSX.Element;
export {};
