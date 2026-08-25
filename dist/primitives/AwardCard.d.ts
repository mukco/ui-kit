import type { ReactNode } from "react";
interface Props {
    icon: ReactNode;
    label: string;
    /** The recipient — name, or anything renderable. */
    winner?: ReactNode;
    detail?: ReactNode;
    className?: string;
}
/** An award: big icon, what it was for, who got it. Sport-neutral on purpose —
    season MVPs and trivia crowns are the same shape. */
export declare function AwardCard({ icon, label, winner, detail, className }: Props): import("react").JSX.Element;
export {};
