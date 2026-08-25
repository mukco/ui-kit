import type { ReactNode } from "react"
import { cn } from "../cn"

export interface InsightSection {
  heading?: string
  bullets: ReactNode[]
}

interface Props {
  title?: string
  loading?: boolean
  /** The upstream response was served from cache. */
  cached?: boolean
  /** Regeneration callback; omit the button entirely when absent. */
  onRegenerate?: () => void
  sections: InsightSection[]
  empty?: ReactNode
  className?: string
}

/**
 * Card for AI-generated text: titled sections of bullets, a cached chip, and
 * a regenerate control. Data fetching stays in the app — pass results in.
 */
export function InsightsCard({
  title = "AI Insights",
  loading = false,
  cached = false,
  onRegenerate,
  sections,
  empty = "Nothing yet.",
  className,
}: Props) {
  const hasContent = sections.some((s) => s.bullets.length > 0)
  return (
    <div className={cn("ui-card ui-insights", className)}>
      <div className="ui-insights-head">
        <h2 className="ui-insights-title">{title}</h2>
        <div className="ui-insights-controls">
          {cached && <span className="ui-insights-cached">Cached</span>}
          {onRegenerate && (
            <button type="button" className="ui-insights-regen" disabled={loading} onClick={onRegenerate}>
              {loading ? "Generating…" : "Regenerate"}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="ui-insights-body">
          <span className="ui-skeleton" style={{ width: "85%" }} />
          <span className="ui-skeleton" style={{ width: "70%" }} />
          <span className="ui-skeleton" style={{ width: "78%" }} />
        </div>
      )}

      {!loading && !hasContent && <p className="ui-insights-empty">{empty}</p>}

      {!loading &&
        sections.map(
          (s, i) =>
            s.bullets.length > 0 && (
              <section key={i} className="ui-insights-body">
                {s.heading && <h3 className="ui-insights-heading">{s.heading}</h3>}
                <ul className="ui-insights-bullets">
                  {s.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </section>
            ),
        )}
    </div>
  )
}
