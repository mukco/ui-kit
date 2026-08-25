import { type ReactNode } from "react";
interface Props {
    children: ReactNode[];
    className?: string;
}
/**
 * Horizontal strip of cards — team pages' scrolling rows. Native touch
 * scrolling on phones; on desktop you can click-drag, and a drag suppresses
 * the trailing click so dragging never opens a card.
 */
export declare function CardStrip({ children, className }: Props): import("react").JSX.Element;
export {};
