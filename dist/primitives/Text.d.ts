import type { ReactNode } from "react";
export type TextSize = "sm" | "md" | "lg" | "xl";
export type TextTone = "default" | "muted" | "brand";
export type TextWeight = "normal" | "medium" | "bold";
interface Props {
    children: ReactNode;
    size?: TextSize;
    tone?: TextTone;
    weight?: TextWeight;
    className?: string;
}
export declare function Text({ children, size, tone, weight, className }: Props): import("react").JSX.Element;
export {};
