import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { cn } from "../cn"
import { EmptyState } from "./EmptyState"
import { Loading } from "./Loading"

export type LogLevel = "error" | "warn" | null

export interface LogEntry {
  id: string | number
  /** Short clock for the meta row, e.g. "02:11:44". */
  stamp?: string | null
  /** Full timestamp, carried through to <time dateTime>. */
  isoStamp?: string | null
  text: string
  level?: LogLevel
  /** Container or app name — shown when one stream merges several sources. */
  source?: string
}

/**
 * What the line is, worked out once. Deliberately crude: these are several
 * apps' worth of unrelated log formats, and anything cleverer would be wrong
 * about most of them. A word has to stand alone to count — "errors_total=0" is
 * not an error, and neither is a path with "warning" in it.
 */
export function logLevelOf(text: string): LogLevel {
  if (/\b(error|fatal|exception|traceback)\b/i.test(text)) return "error"
  if (/\bwarn(ing)?\b/i.test(text)) return "warn"
  return null
}

/**
 * Split a docker-shaped log body into entries. Pure — the app does the
 * fetching and hands the body here.
 *
 * docker writes an RFC 3339 stamp in front of every line. It is the only
 * trustworthy clock available (an app's own timestamps are whatever it decided
 * to print), but it is not what anybody is reading for, so it is split off the
 * message rather than left in front of it.
 */
export function parseLogBody(body: string, source?: string): LogEntry[] {
  return body
    .replace(/\n$/, "")
    .split("\n")
    .map((line, index) => {
      const [head = "", ...rest] = line.split(" ")
      const dated = /^\d{4}-\d\d-\d\dT/.test(head)
      const text = dated ? rest.join(" ") : line
      return {
        id: index,
        stamp: dated ? head.slice(11, 19) : null,
        isoStamp: dated ? head : null,
        text,
        level: logLevelOf(text),
        source,
      }
    })
}

interface Props {
  /** null while the app is still fetching. */
  entries: LogEntry[] | null
  /** Freshness line under the stream: "300 lines · written 2m ago". */
  footer?: ReactNode
  /** Lines a long entry folds to before it offers "Show all". */
  clampLines?: number
  loadingLabel?: string
  emptyLabel?: string
  className?: string
}

/**
 * A container's output, readable on a phone.
 *
 * Four things a log view has to get right on a small screen, all of them
 * CSS-driven so this is one component and not two:
 *
 * - **No box inside the page.** Above 640px the stream scrolls in its own
 *   pane; below it the height cap comes off and the page is the only scroll
 *   surface. A scrollable box inside a scrolling page is the single worst
 *   thing a log view does to a thumb.
 * - **The message gets the full width.** The entry is a two-column grid — meta,
 *   then text — which collapses to one column on phones, so the stamp sits
 *   above the message instead of eating a quarter of the line. The grid also
 *   gives wrapped lines a hanging indent for free.
 * - **Long lines fold.** A wrapped 400-character backtrace otherwise fills the
 *   viewport and buries everything after it.
 * - **No sideways scrolling.** The no-wrap escape hatch is hidden below 640px,
 *   where it would mean panning a nested scroller.
 *
 * Levels are a coloured edge *and* a word, never colour alone.
 */
export function LogStream({
  entries,
  footer,
  clampLines = 6,
  loadingLabel = "Reading…",
  emptyLabel = "Nothing in this log yet.",
  className,
}: Props) {
  const [needle, setNeedle] = useState("")
  const [problemsOnly, setProblemsOnly] = useState(false)
  const [nowrap, setNowrap] = useState(false)
  const [opened, setOpened] = useState<ReadonlySet<string | number>>(new Set())
  const box = useRef<HTMLDivElement>(null)
  // Only follow the end while the reader is already there. Snapping someone
  // back to the bottom while they are reading further up is the worst thing a
  // log view does. (Below 640px there is no pane to scroll, so this idles.)
  const following = useRef(true)

  const all = entries ?? []

  const shown = useMemo(() => {
    const want = needle.trim().toLowerCase()
    return all.filter((entry) => {
      if (problemsOnly && !entry.level) return false
      return want === "" || entry.text.toLowerCase().includes(want)
    })
  }, [all, needle, problemsOnly])

  const problems = useMemo(() => all.filter((entry) => entry.level).length, [all])

  useEffect(() => {
    if (following.current && box.current) box.current.scrollTop = box.current.scrollHeight
  }, [shown])

  if (entries === null) return <Loading label={loadingLabel} />

  function toggle(id: string | number) {
    setOpened((was) => {
      const next = new Set(was)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn("ui-log", className)}>
      <div className="ui-log-tools">
        <input
          type="search"
          className="ui-log-find"
          value={needle}
          placeholder="Find in this log"
          aria-label="Find in this log"
          onChange={(event) => setNeedle(event.target.value)}
        />
        <button
          type="button"
          aria-pressed={problemsOnly}
          className={cn("ui-log-toggle", problemsOnly && "is-on")}
          onClick={() => setProblemsOnly((was) => !was)}
          // Nought is the number this should be, so it is worth saying even
          // when there is nothing to filter down to.
          title="Only lines mentioning an error, exception or warning"
        >
          Problems {problems}
        </button>
        <button
          type="button"
          aria-pressed={nowrap}
          className={cn("ui-log-toggle", "ui-log-wrap-toggle", nowrap && "is-on")}
          onClick={() => setNowrap((was) => !was)}
          title="Stop wrapping long lines and scroll sideways instead"
        >
          No wrap
        </button>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon="⌕">{all.length === 0 ? emptyLabel : "No lines match that."}</EmptyState>
      ) : (
        <div
          ref={box}
          tabIndex={0}
          role="log"
          className={cn("ui-log-body", nowrap && "is-nowrap")}
          style={{ ["--ui-log-clamp" as string]: clampLines }}
          onScroll={(event) => {
            const view = event.currentTarget
            following.current = view.scrollHeight - view.scrollTop - view.clientHeight < 24
          }}
        >
          {shown.map((entry) => {
            // A character heuristic rather than a measured height: measuring
            // every line would thrash layout on a 300-line stream, and being
            // one line out either way costs nothing here.
            const long = entry.text.length > clampLines * 40
            const isOpen = opened.has(entry.id)
            return (
              <div
                key={entry.id}
                className={cn(
                  "ui-log-entry",
                  entry.level && `ui-log-entry--${entry.level}`,
                  isOpen && "is-open",
                )}
              >
                <span className="ui-log-meta">
                  {entry.stamp && (
                    <time className="ui-log-stamp" dateTime={entry.isoStamp ?? undefined}>
                      {entry.stamp}
                    </time>
                  )}
                  {entry.source && <span className="ui-log-source">{entry.source}</span>}
                  {entry.level && <span className="ui-log-level">{entry.level.toUpperCase()}</span>}
                </span>
                <span className="ui-log-text">{entry.text}</span>
                {long && (
                  <button type="button" className="ui-log-more" onClick={() => toggle(entry.id)}>
                    {isOpen ? "Less" : "Show all"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {footer && <p className="ui-log-foot">{footer}</p>}
    </div>
  )
}
