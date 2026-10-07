import type { ReactNode } from "react";
/**
 * The frame of a fantasy page, shared by every app's fantasy section
 * whatever the platform behind it (ESPN, Ottoneu): a bar saying whose team
 * this is and how it stands, then the tabs and the tab's content in a main
 * column, with an optional sidebar of league context beside it.
 */
export interface FantasyTeamBarItem {
    key: string;
    content: ReactNode;
    /** bad: something wrong (players out, penalties) · good/warn: cap room ·
        muted: plain context (rostered, salary). Default is the text colour. */
    tone?: "good" | "warn" | "bad" | "muted";
}
export interface FantasyTeamBarProps {
    /** The team's name — or a picker, when the reader has not said which team is theirs. */
    team: ReactNode;
    /** A crest or avatar before the name. */
    avatar?: ReactNode;
    /** "4-38", "12-3-1". */
    record?: ReactNode;
    items?: FantasyTeamBarItem[];
    /** At the far end: "Full roster · IL players cannot score", a draft date. */
    note?: ReactNode;
    className?: string;
}
/** Whose team this is and how it stands: name, record, and the few numbers a manager checks first. */
export declare function FantasyTeamBar({ team, avatar, record, items, note, className }: FantasyTeamBarProps): import("react").JSX.Element;
export interface FantasyLayoutProps {
    children: ReactNode;
    /** League context beside the main column: standings, the roster, a watchlist. */
    sidebar?: ReactNode;
    className?: string;
}
/**
 * Main column plus sidebar. From 1024px the sidebar sits beside the main
 * column, sticky, scrolling on its own; narrower, it follows the main column
 * rather than disappearing, so a phone still reaches the league context.
 */
export declare function FantasyLayout({ children, sidebar, className }: FantasyLayoutProps): import("react").JSX.Element;
