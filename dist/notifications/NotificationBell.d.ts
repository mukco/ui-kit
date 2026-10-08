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
interface Props {
    items: NotificationItem[];
    /** Called when an item is tapped (typically to mark it read + navigate). */
    onItemClick?: (item: NotificationItem) => void;
    onDismissAll?: () => void;
    onMarkAllRead?: () => void;
    /** Dismiss one: a swipe left, or Delete on the focused row. */
    onDismiss?: (item: NotificationItem) => void;
    action?: NotificationAction;
    /** The empty sheet's way to the app's notification settings. */
    settings?: {
        label?: ReactNode;
        onClick: () => void;
    };
    empty?: string;
    className?: string;
}
/**
 * The bell, its count, and the sheet it opens — Family Hub's (2026-10-02),
 * shared by the sports apps. It was a small dropdown hung off the bell: on a
 * phone, tiny type and a corner ✕. Now on a phone it is a sheet the full width
 * of the screen from under the bar to the bottom, rows at the phone's type
 * scale, its actions real buttons at the top, and the list split into Today
 * and Earlier; a desktop keeps a popover under the bell. Drawn into <body>
 * so no bar's rules reach into it.
 */
export declare function NotificationBell({ items, onItemClick, onDismissAll, onMarkAllRead, onDismiss, action, settings, empty, className }: Props): import("react").JSX.Element;
export {};
