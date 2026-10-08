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
    className?: string;
}
/** A video or a post has no text to read in the app: it opens where it lives. */
export declare function opensOutside(url: string | null | undefined): boolean;
export declare function ArticleReader({ url, seed, story, loading, failed, onBack, className }: ArticleReaderProps): import("react").JSX.Element;
