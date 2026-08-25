import type { ReactNode } from "react";
interface Props {
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}
/** A friendly nothing-here block. */
export declare function EmptyState({ icon, children, className }: Props): import("react").JSX.Element;
export {};
