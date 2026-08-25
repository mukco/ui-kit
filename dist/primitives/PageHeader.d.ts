import type { ReactNode } from "react";
interface Props {
    title: ReactNode;
    subtitle?: ReactNode;
    /** Right-aligned action buttons. */
    actions?: ReactNode;
    onBack?: () => void;
    className?: string;
}
/** A screen's header line: optional back arrow, title, subtitle, actions. */
export declare function PageHeader({ title, subtitle, actions, onBack, className }: Props): import("react").JSX.Element;
export {};
