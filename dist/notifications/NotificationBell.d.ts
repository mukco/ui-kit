import { type ReactNode } from "react";
export interface NotificationItem {
    id: string;
    icon?: ReactNode;
    title: ReactNode;
    body?: ReactNode;
    time?: ReactNode;
    /** Where it came from, shown before the time ("ESPN", "League"). */
    source?: ReactNode;
    /** When it happened (ISO): splits the list into Today and Earlier. */
    at?: string | null;
    /** Not yet read: a dot, and the title in the strong weight. Unset means unread. */
    unread?: boolean;
}
/** A secondary action on every row, e.g. "Open in chat →". */
export interface NotificationAction {
    label: ReactNode;
    onClick: (item: NotificationItem) => void;
}
/** Icons the sheet draws, for an app that wants its own (Family Hub's pixel set). Unset: the kit's line icons, or none. */
export interface NotificationIcons {
    /** The close key in the sheet's header. */
    close?: ReactNode;
    /** Over the empty sheet. */
    empty?: ReactNode;
    /** In the Mark all read key. */
    markAllRead?: ReactNode;
    /** In the Clear all key. */
    clearAll?: ReactNode;
    /** Beside "Dismiss" under a row being swiped. */
    dismiss?: ReactNode;
}
/** The sheet's options, shared by NotificationBell and NotificationSheet. All optional; unset is the sports apps' sheet. */
export interface NotificationSheetOptions {
    items: NotificationItem[];
    /** Called when an item is tapped (typically to mark it read + navigate). */
    onItemClick?: (item: NotificationItem) => void;
    onDismissAll?: () => void;
    onMarkAllRead?: () => void;
    /** Dismiss one: a swipe left, or Delete on the focused row. */
    onDismiss?: (item: NotificationItem) => void;
    action?: NotificationAction;
    /** The empty sheet's way to the app's notification settings. With `href` it is a link (a plain click still calls onClick, which should navigate). */
    settings?: {
        label?: ReactNode;
        onClick: () => void;
        href?: string;
    };
    empty?: string;
    /** A line under the empty sheet's title. */
    emptyText?: ReactNode;
    /** The unread count when the app knows better than the items it passed (a server that lists 50 but counts all). */
    unreadCount?: number;
    /** Still fetching and nothing to show yet: `loadingContent` (or a skeleton) in place of the list. */
    loading?: boolean;
    loadingContent?: ReactNode;
    /** The last fetch failed. With no items: a failed state (role alert) with Retry; with items: a line saying they may be stale. */
    failed?: boolean;
    onRetry?: () => void;
    /** The failed state's line under its title. */
    failedText?: ReactNode;
    /** A line under the list ("Tap one to go to it; swipe it left to dismiss it."). */
    hint?: ReactNode;
    icons?: NotificationIcons;
    /** Each row's time on the title's line, at the right (Family Hub), rather than under the body with the source. */
    timeInTitle?: boolean;
    /** Which items go under Today (default: the same calendar date as now). */
    isToday?: (at: string) => boolean;
}
interface Props extends NotificationSheetOptions {
    /** The bell's own icon (default: the kit's line bell). */
    icon?: ReactNode;
    /** The sheet opened: fetch the list now, say. */
    onOpen?: () => void;
    className?: string;
}
export interface NotificationSheetProps extends NotificationSheetOptions {
    /** Close it (Escape, the close key, the scrim, a row tapped). */
    onClose: () => void;
    /** The dialog's id, for the trigger's aria-controls. */
    id?: string;
    /** After the page's scroll is unlocked on close (an app that must repaint fixed bars on iOS). */
    onUnlocked?: () => void;
}
/**
 * The bell's sheet on its own, for an app that draws its own bell (Family
 * Hub's sits in its menu bar). Render it while open — into <body>, so no
 * bar's rules reach into it. While mounted it owns the touch: the page does
 * not scroll behind it, body[data-swiping] tells the app's gestures to stand
 * down, focus is on its heading, and Escape closes it.
 */
export declare function NotificationSheet({ items, onClose, onItemClick, onDismissAll, onMarkAllRead, onDismiss, action, settings, empty, emptyText, unreadCount, loading, loadingContent, failed, onRetry, failedText, hint, icons, timeInTitle, id, onUnlocked, top, isToday: today, }: NotificationSheetProps & {
    top?: number;
}): import("react").JSX.Element;
/**
 * The bell, its count, and the sheet it opens — Family Hub's (2026-10-02),
 * shared by the sports apps. It was a small dropdown hung off the bell: on a
 * phone, tiny type and a corner ✕. Now on a phone it is a sheet the full width
 * of the screen from under the bar to the bottom, rows at the phone's type
 * scale, its actions real buttons at the top, and the list split into Today
 * and Earlier; a desktop keeps a popover under the bell. Drawn into <body>
 * so no bar's rules reach into it.
 */
export declare function NotificationBell({ icon, onOpen, className, ...sheet }: Props): import("react").JSX.Element;
export {};
