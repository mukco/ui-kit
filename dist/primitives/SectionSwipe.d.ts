import type { TabBarTab } from "./TabBar";
export interface SectionSwipeOptions {
    sections: TabBarTab[];
    pathname: string;
    onNavigate: (to: string) => void;
    /** Back from an inner page (the app's router: navigate(-1)). */
    onBack: () => void;
    /** Off where swiping makes no sense (a full-screen editor, say). */
    enabled?: boolean;
}
export declare function useSectionSwipe({ sections, pathname, onNavigate, onBack, enabled }: SectionSwipeOptions): void;
/**
 * The strip a sideways swipe uncovers: the destination's icon large in its
 * middle — a section's tab icon, or ← for Back — in a ring that fills toward
 * the point where letting go will act, solid once it will. Render once.
 */
export declare function SwipeBand({ sections }: {
    sections: TabBarTab[];
}): import("react").JSX.Element;
