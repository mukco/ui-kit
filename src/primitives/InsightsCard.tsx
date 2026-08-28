import type { ReactNode } from "react"
import { cn } from "../cn"
import { AiPanelHeader } from "./AiPanelHeader"

export interface InsightSection {
  heading?: string
  bullets: ReactNode[]
  /**
   * Rendered under the section's bullets — the entities the section talks
   * about, as links. Baseball's game insights put a row of player links there
   * and that slot is the only reason its panel could not be this component.
   */
  footer?: ReactNode
}

interface Props {
  title?: string
  /**
   * The pill beside the title. This says the text below was written by a model,
   * which is the one thing a reader needs to know before reading it, so it is
   * on by default — every panel built from this component is an AI panel. Pass
   * null to drop it.
   */
  badge?: ReactNode | null
  /** Rendered after the badge — a matchup, a date range, whatever names the subject. */
  headerExtra?: ReactNode
  loading?: boolean
  /** True while a background revalidation is in flight (stale content still visible). */
  isRefreshing?: boolean
  /** The upstream response was served from cache. */
  cached?: boolean
  /** ISO timestamp when the cached answer was generated. */
  generatedAt?: string | null
  /**
   * Which model produced this, e.g. "gpt-5-nano-2025-08-07".
   *
   * AI text is not like other content: two panels can look identical and be
   * the work of different models, and when an answer is wrong the first useful
   * question is which model wrote it.
   */
  model?: string | null
  /** Optional line under the title explaining what this card covers. */
  description?: ReactNode
  /** Render each section's bullets as a numbered list with chip badges instead of a plain bulleted list. */
  numbered?: boolean
  /**
   * "grid" gives every section its own bordered box, two across on a wide
   * screen. Sections of AI text are separately generated and separately
   * cached, and running them together in one column says the opposite — that
   * they are one answer. Use it wherever the sections are independent.
   */
  layout?: "stacked" | "grid"
  /** Regeneration callback; omit the button entirely when absent. */
  onRegenerate?: () => void
  sections: InsightSection[]
  empty?: ReactNode
  /**
   * Fixed panel height. The body scrolls inside it and fades out at the
   * bottom, so a card in a grid keeps its row's height however long the answer
   * runs. Both apps had this as a second, hand-rolled copy of the whole card
   * — the capped variant was the ONLY thing it did differently, and it is a
   * prop, not a component.
   */
  height?: string | number
  /**
   * A failure to report. Shown instead of the empty line when there is nothing
   * to display, and above the content when there is — a stale answer that
   * failed to refresh is still worth reading, but the reader should know.
   */
  error?: ReactNode
  className?: string
}

/**
 * Card for AI-generated text: a titled, badged header with the provenance of
 * the answer, then sections of bullets. Data fetching stays in the app.
 */
export function InsightsCard({
  title = "AI Insights",
  badge = "AI",
  headerExtra,
  loading = false,
  isRefreshing = false,
  cached = false,
  generatedAt,
  model,
  description,
  numbered = false,
  layout = "stacked",
  onRegenerate,
  sections,
  empty = "Nothing yet.",
  height,
  error,
  className,
}: Props) {
  const hasContent = sections.some((s) => s.bullets.length > 0)
  const showSkeleton = loading && !hasContent
  const showContent = !showSkeleton && hasContent

  const body = (
    <>
      {showSkeleton && (
        <div className="ui-insights-body">
          <span className="ui-skeleton" style={{ width: "85%" }} />
          <span className="ui-skeleton" style={{ width: "70%" }} />
          <span className="ui-skeleton" style={{ width: "78%" }} />
        </div>
      )}

      {isRefreshing && hasContent && (
        <p className="ui-insights-note">Refreshing live data… showing last good insights.</p>
      )}

      {error != null && <p className="ui-insights-note">{error}</p>}

      {!showSkeleton && !hasContent && error == null && <p className="ui-insights-empty">{empty}</p>}

      {showContent && (
        <div className={cn(layout === "grid" && "ui-insights-grid")}>
          {sections.map(
            (s, i) =>
              s.bullets.length > 0 && (
                <section key={i} className={cn(layout === "grid" ? "ui-insights-box" : "ui-insights-body")}>
                  {s.heading && <h3 className="ui-insights-heading">{s.heading}</h3>}
                  {numbered ? (
                    <ul className="ui-insights-numbered">
                      {/* Numbering restarts in every section. It used to run
                          straight through, so four independent answers read as
                          one list of twelve. */}
                      {s.bullets.map((b, j) => (
                        <li key={j} className="ui-insights-numbered-item">
                          <span className="ui-insights-num">{j + 1}</span>
                          <p className="ui-insights-item-text">{b}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="ui-insights-bullets">
                      {s.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {s.footer}
                </section>
              ),
          )}
        </div>
      )}
    </>
  )

  return (
    <div
      className={cn("ui-card ui-insights", height != null && "ui-insights--capped", className)}
      style={height != null ? { height } : undefined}
    >
      <AiPanelHeader
        title={title}
        badge={badge}
        headerExtra={headerExtra}
        isRefreshing={isRefreshing}
        hasContent={hasContent}
        cached={cached}
        generatedAt={generatedAt}
        model={model}
        action={
          onRegenerate && (
            <button type="button" className="ui-insights-regen" disabled={loading || isRefreshing} onClick={onRegenerate}>
              {loading || isRefreshing ? "Generating…" : "Regenerate"}
            </button>
          )
        }
      />

      {description && <p className="ui-insights-desc">{description}</p>}

      {height != null ? (
        <div className="ui-insights-window">
          <div className="ui-insights-scroll">{body}</div>
          <div className="ui-insights-fade" aria-hidden="true" />
        </div>
      ) : (
        body
      )}
    </div>
  )
}
