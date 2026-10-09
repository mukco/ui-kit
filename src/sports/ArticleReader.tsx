import { useEffect, type ReactNode } from "react"
import { Share as PxShare } from "pixelarticons/react"
import { cn } from "../cn"
import { age } from "../lib/age"
import { Button } from "../primitives/Button"
import { Skin } from "../primitives/Pixel"
import { Skeleton } from "../primitives/Skeleton"

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
  kind: "p" | "h" | "quote" | "li"
  text: string
}

export interface ArticleStory {
  title?: string | null
  source?: string | null
  image_url?: string | null
  byline?: string | null
  published_at?: string | null
  readable: boolean
  blocks: ArticleBlock[]
  /** The server's own short summary, shown when the story is too short to read here. Before the seed's. */
  summary?: string | null
}

/** What the list already knew, shown while the story loads. */
export interface ArticleSeed {
  title?: string | null
  source?: string | null
  imageUrl?: string | null
  summary?: string | null
  publishedAt?: string | null
}

export interface ArticleReaderProps {
  url: string
  seed?: ArticleSeed | null
  story?: ArticleStory | null
  loading?: boolean
  failed?: boolean
  onBack: () => void
  /** More keys after Share (Family Hub's "Save for later"). */
  actions?: ReactNode
  /** How Share went: the share sheet finished, the link was copied (no share sheet), or copying failed. Not called when the sheet is dismissed. */
  onShared?: (how: "shared" | "copied" | "failed") => void
  className?: string
}

const hostOf = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, "") } catch { return "" }
}

/** A video or a post has no text to read in the app: it opens where it lives. */
export function opensOutside(url: string | null | undefined): boolean {
  return /(^|\.)(youtube\.com|youtu\.be|bsky\.app|vimeo\.com|x\.com|twitter\.com|instagram\.com|tiktok\.com)$/i.test(hostOf(url ?? ""))
}

const LineShare = (props: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
)

function share(title: string, url: string, onShared?: ArticleReaderProps["onShared"]) {
  if (typeof navigator === "undefined") return
  if (navigator.share) { navigator.share({ title, url }).then(() => onShared?.("shared"), () => undefined); return }
  navigator.clipboard?.writeText(url).then(() => onShared?.("copied"), () => onShared?.("failed"))
}

export function ArticleReader({ url, seed, story, loading, failed, onBack, actions, onShared, className }: ArticleReaderProps) {
  useEffect(() => { window.scrollTo(0, 0) }, [url])

  const title = story?.title || seed?.title || ""
  const source = seed?.source || story?.source || hostOf(url)
  const art = story?.image_url || seed?.imageUrl || null
  const summary = story?.summary || seed?.summary || null
  const when = age(story?.published_at || seed?.publishedAt)
  const pending = !story && loading && !failed
  const short = !pending && !story?.readable

  return (
    <article className={cn("ui-article", className)}>
      <div className="ui-article-bar">
        <button type="button" className="ui-article-back" data-back onClick={onBack}>← Back</button>
        <span className="ui-article-source">{source}</span>
      </div>
      {art && (
        <img className="ui-article-art" src={art} alt="" decoding="async"
             onError={(e) => { e.currentTarget.style.display = "none" }} />
      )}
      <h1 className="ui-article-title">{title}</h1>
      <div className="ui-article-keys">
        <Button size="sm" onClick={() => share(title, url, onShared)} className="ui-article-share">
          <Skin px={<PxShare className="ui-article-icon" />}><LineShare className="ui-article-icon" /></Skin>
          Share
        </Button>
        {actions}
      </div>
      <p className="ui-article-meta">
        <img className="ui-article-favicon" src={`https://www.google.com/s2/favicons?domain=${hostOf(url)}&sz=32`} alt="" loading="lazy"
             onError={(e) => { e.currentTarget.style.display = "none" }} />
        <span>{[source, when, story?.byline ? `By ${story.byline}` : null].filter(Boolean).join(" · ")}</span>
      </p>
      {pending ? (
        <div className="ui-article-body"><Skeleton lines={9} /></div>
      ) : story?.readable ? (
        <div className="ui-article-body">
          {story.blocks.map((b, i) => b.kind === "h" ? <h2 key={i}>{b.text}</h2>
            : b.kind === "quote" ? <blockquote key={i}>{b.text}</blockquote>
            : b.kind === "li" ? <p key={i} className="ui-article-li">{b.text}</p>
            : <p key={i}>{b.text}</p>)}
        </div>
      ) : (
        <div className="ui-article-body">
          {summary && <p>{summary}</p>}
          <p className="ui-article-note">{failed ? "Couldn't fetch this story just now." : `This one reads best on ${source}.`}</p>
        </div>
      )}
      <a className={cn("ui-article-original", short && "ui-article-original--main")} href={url} target="_blank" rel="noreferrer noopener">
        Read at {source} ↗
      </a>
    </article>
  )
}
