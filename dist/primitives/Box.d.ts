import type { ReactNode } from "react";
export type BoxSurface = "surface" | "surface-2" | "transparent";
export type BoxPadding = "none" | "sm" | "md" | "lg";
interface Props {
    children?: ReactNode;
    surface?: BoxSurface;
    padding?: BoxPadding;
    border?: boolean;
    className?: string;
}
export declare function Box({ children, surface, padding, border, className }: Props): import("react").JSX.Element;
export {};
