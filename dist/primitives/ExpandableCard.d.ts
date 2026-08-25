import { type ReactNode } from "react";
interface Props {
    title: ReactNode;
    /** Always-visible summary line under the title. */
    subtitle?: ReactNode;
    open?: boolean;
    onToggle?: (open: boolean) => void;
    children: ReactNode;
    className?: string;
}
/** Card whose body folds away behind a header row — the expandable cards
    used across player and team pages. Controlled or self-contained. */
export declare function ExpandableCard({ title, subtitle, open, onToggle, children, className }: Props): import("react").JSX.Element;
export {};
