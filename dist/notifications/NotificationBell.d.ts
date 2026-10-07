import { type ReactNode } from "react";
export interface NotificationItem {
    id: string;
    icon?: ReactNode;
    title: ReactNode;
    body?: ReactNode;
    time?: ReactNode;
    /** Where it came from, shown before the time ("ESPN", "League"). */
    source?: ReactNode;
}
/** A secondary action on every row, e.g. "Open in chat →". */
export interface NotificationAction {
    label: ReactNode;
    onClick: (item: NotificationItem) => void;
}
interface Props {
    items: NotificationItem[];
    /** Called when an item is clicked (typically to dismiss + navigate). */
    onItemClick?: (item: NotificationItem) => void;
    onDismissAll?: () => void;
    /** Per-row dismiss (×). */
    onDismiss?: (item: NotificationItem) => void;
    action?: NotificationAction;
    empty?: string;
    className?: string;
}
/** Bell with unread badge opening a dropdown list. Items and dismissal are
    the app's business; the kit draws the affordance. */
export declare function NotificationBell({ items, onItemClick, onDismissAll, onDismiss, action, empty, className }: Props): import("react").JSX.Element;
export {};
