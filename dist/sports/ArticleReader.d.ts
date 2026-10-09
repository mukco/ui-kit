import { type ReactNode } from "react";
/**
 * A news story read inside the app — Family Hub's Paper reader (2026-10-07),
 * for the sports apps. A story used to open in iOS's Safari panel, where
 * nothing said this was still the app; now it is the app's own page, with
 * Back and the swipe, and the story as plain text the server boiled it down
 * to (Estate::Article in estate-utils).
 *
 * A paywall or a page drawn by its scripts gives too little: the summary
 * then, and the way to the original, which is at the foot of every story
 * anyway. The kit draws; the app fetches (`story`, `loading`, `failed`).
 *
 * Family Hub draws it too (2026-10-09), with its Save key in `actions`, a
 * toast from `onShared`, and its section swipe pressing the Back key, which
 * carries `data-back` so any app's swipe can find the page's own Back.
 */
export interface ArticleBlock {
    kind: "p" | "h" | "quote" | "li";
    text: string;
}
export interface ArticleStory {
    title?: string | null;
    source?: string | null;
    image_url?: string | null;
    byline?: string | null;
    published_at?: string | null;
    readable: boolean;
    blocks: ArticleBlock[];
    /** The server's own short summary, shown when the story is too short to read here. Before the seed's. */
    summary?: string | null;
}
/** What the list already knew, shown while the story loads. */
export interface ArticleSeed {
    title?: string | null;
    source?: string | null;
    imageUrl?: string | null;
    summary?: string | null;
    publishedAt?: string | null;
}
export interface ArticleReaderProps {
    url: string;
    seed?: ArticleSeed | null;
    story?: ArticleStory | null;
    loading?: boolean;
    failed?: boolean;
    onBack: () => void;
    /** More keys after Share (Family Hub's "Save for later"). */
    actions?: ReactNode;
    /** How Share went: the share sheet finished, the link was copied (no share sheet), or copying failed. Not called when the sheet is dismissed. */
    onShared?: (how: "shared" | "copied" | "failed") => void;
    className?: string;
}
/** A video or a post has no text to read in the app: it opens where it lives. */
export declare function opensOutside(url: string | null | undefined): boolean;
export declare function ArticleReader({ url, seed, story, loading, failed, onBack, actions, onShared, className }: ArticleReaderProps): import("react").JSX.Element;
