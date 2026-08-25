import { type ReactNode } from "react";
export interface NotificationItem {
    id: string;
    icon?: ReactNode;
    title: ReactNode;
    body?: ReactNode;
    time?: ReactNode;
}
interface Props {
    items: NotificationItem[];
    /** Called when an item is clicked (typically to dismiss + navigate). */
    onItemClick?: (item: NotificationItem) => void;
    onDismissAll?: () => void;
    empty?: string;
    className?: string;
}
/** Bell with unread badge opening a dropdown list. Items and dismissal are
    the app's business; the kit draws the affordance. */
export declare function NotificationBell({ items, onItemClick, onDismissAll, empty, className }: Props): import("react").JSX.Element;
export {};
