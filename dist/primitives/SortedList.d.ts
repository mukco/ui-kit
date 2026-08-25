import { type HTMLAttributes, type ReactNode } from "react";
interface Props<T> {
    items: T[];
    getKey: (item: T, index: number) => string;
    /** Receives the reordered array; the list stays controlled by the app. */
    onReorder: (next: T[]) => void;
    /** Render one row. Spread `handle` on your drag handle button. */
    renderItem: (item: T, handle: HTMLAttributes<HTMLButtonElement>, dragging: boolean) => ReactNode;
    className?: string;
}
/**
 * Vertical drag-to-reorder list (dnd-kit under the hood). Keyboard and touch
 * work via the same handle. This is what powers notebook-cell reordering;
 * pass each cell's dragHandleProps through like SandboxCell expects.
 */
export declare function SortedList<T>({ items, getKey, onReorder, renderItem, className }: Props<T>): import("react").JSX.Element;
export {};
