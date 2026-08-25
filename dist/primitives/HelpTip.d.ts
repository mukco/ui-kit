import { type ReactNode } from "react";
interface Props {
    /** The help content. Keep it one or two short sentences. */
    children: ReactNode;
}
/** A small "?" that reveals help text on hover or keyboard focus. */
export declare function HelpTip({ children }: Props): import("react").JSX.Element;
export {};
