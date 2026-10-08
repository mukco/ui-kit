import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Share as PxShare } from "pixelarticons/react";
import { cn } from "../cn";
import { age } from "../lib/age";
import { Button } from "../primitives/Button";
import { Skin } from "../primitives/Pixel";
import { Skeleton } from "../primitives/Skeleton";
const hostOf = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    }
    catch {
        return "";
    }
};
/** A video or a post has no text to read in the app: it opens where it lives. */
export function opensOutside(url) {
    return /(^|\.)(youtube\.com|youtu\.be|bsky\.app|vimeo\.com|x\.com|twitter\.com|instagram\.com|tiktok\.com)$/i.test(hostOf(url ?? ""));
}
const LineShare = (props) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...props, children: _jsx("path", { d: "M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" }) }));
function share(title, url) {
    if (typeof navigator === "undefined")
        return;
    if (navigator.share) {
        navigator.share({ title, url }).catch(() => undefined);
        return;
    }
    navigator.clipboard?.writeText(url).catch(() => undefined);
}
export function ArticleReader({ url, seed, story, loading, failed, onBack, className }) {
    useEffect(() => { window.scrollTo(0, 0); }, [url]);
    const title = story?.title || seed?.title || "";
    const source = seed?.source || story?.source || hostOf(url);
    const art = story?.image_url || seed?.imageUrl || null;
    const summary = seed?.summary || null;
    const when = age(story?.published_at || seed?.publishedAt);
    const pending = !story && loading && !failed;
    const short = !pending && !story?.readable;
    return (_jsxs("article", { className: cn("ui-article", className), children: [_jsxs("div", { className: "ui-article-bar", children: [_jsx("button", { type: "button", className: "ui-article-back", onClick: onBack, children: "\u2190 Back" }), _jsx("span", { className: "ui-article-source", children: source })] }), art && (_jsx("img", { className: "ui-article-art", src: art, alt: "", decoding: "async", onError: (e) => { e.currentTarget.style.display = "none"; } })), _jsx("h1", { className: "ui-article-title", children: title }), _jsx("div", { className: "ui-article-keys", children: _jsxs(Button, { size: "sm", onClick: () => share(title, url), className: "ui-article-share", children: [_jsx(Skin, { px: _jsx(PxShare, { className: "ui-article-icon" }), children: _jsx(LineShare, { className: "ui-article-icon" }) }), "Share"] }) }), _jsxs("p", { className: "ui-article-meta", children: [_jsx("img", { className: "ui-article-favicon", src: `https://www.google.com/s2/favicons?domain=${hostOf(url)}&sz=32`, alt: "", loading: "lazy", onError: (e) => { e.currentTarget.style.display = "none"; } }), _jsx("span", { children: [source, when, story?.byline ? `By ${story.byline}` : null].filter(Boolean).join(" · ") })] }), pending ? (_jsx("div", { className: "ui-article-body", children: _jsx(Skeleton, { lines: 9 }) })) : story?.readable ? (_jsx("div", { className: "ui-article-body", children: story.blocks.map((b, i) => b.kind === "h" ? _jsx("h2", { children: b.text }, i)
                    : b.kind === "quote" ? _jsx("blockquote", { children: b.text }, i)
                        : b.kind === "li" ? _jsx("p", { className: "ui-article-li", children: b.text }, i)
                            : _jsx("p", { children: b.text }, i)) })) : (_jsxs("div", { className: "ui-article-body", children: [summary && _jsx("p", { children: summary }), _jsx("p", { className: "ui-article-note", children: failed ? "Couldn't fetch this story just now." : `This one reads best on ${source}.` })] })), _jsxs("a", { className: cn("ui-article-original", short && "ui-article-original--main"), href: url, target: "_blank", rel: "noreferrer noopener", children: ["Read at ", source, " \u2197"] })] }));
}
