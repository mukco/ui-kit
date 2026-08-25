import type { KeyboardEvent, ReactNode } from "react"
import { cn } from "../cn"
import { Button } from "./Button"
import { SEVERITY_ORDER, StatusDot, type Severity } from "./Status"

export interface TriageItem {
  id: string
  severity: Severity
  title: ReactNode
  /** Why, in a sentence. The thing that saves opening another page. */
  detail?: ReactNode
  /** ISO 8601. Rendered as an age, because "3h ago" is the useful form. */
  at?: string | null
  action?: { label: string; href?: string; onClick?: () => void }
}

function age(iso: string): string | null {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return null
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 90) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return hours < 48 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`
}

/**
 * Everything wrong, in one place, worst first.
 *
 * The point is that it is *one* list. The same facts scattered across a dozen
 * cards mean going to look for them, which is the thing nobody does until
 * something has already broken — so a dashboard whose top answers "is anything
 * wrong" is worth more than one that merely contains the answer somewhere.
 *
 * Sorted here rather than by the caller: a triage list sorted any other way is
 * not a triage list, so it is not an option worth offering.
 */
export function TriageList({
  items,
  emptyLabel = "Nothing needs attention.",
  className,
}: {
  items: TriageItem[]
  emptyLabel?: ReactNode
  className?: string
}) {
  const sorted = [...items].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  )

  if (sorted.length === 0) {
    return (
      <p className={cn("ui-triage-clear", className)}>
        <StatusDot tone="ok" /> {emptyLabel}
      </p>
    )
  }

  return (
    <ul className={cn("ui-triage", className)}>
      {sorted.map((item) => {
        const when = item.at ? age(item.at) : null
        // A row that opens something *is* the button. A separate grey box
        // labelled "Open" sitting inside it is a second target for the same
        // intent, it reads as inert next to the text it belongs to, and on a
        // phone it takes a quarter of the row to say what a chevron says.
        const opens = Boolean(item.action?.onClick)
        return (
          <li
            key={item.id}
            className={cn(
              "ui-triage-row",
              `ui-triage-row--${item.severity}`,
              opens && "ui-triage-row--opens",
            )}
            {...(opens
              ? {
                  role: "button",
                  tabIndex: 0,
                  onClick: item.action?.onClick,
                  onKeyDown: (e: KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      item.action?.onClick?.()
                    }
                  },
                }
              : {})}
          >
            <StatusDot tone={item.severity} className="ui-triage-dot" />
            <span className="ui-triage-body">
              <span className="ui-triage-title">{item.title}</span>
              {item.detail != null && <span className="ui-triage-detail">{item.detail}</span>}
            </span>
            {when && <time className="ui-triage-age" dateTime={item.at ?? undefined}>{when}</time>}
            {/* A link goes somewhere else and stays a link — it opens in a new
                tab and should say so. A row that navigates within the app gets
                a chevron, because the row itself is the target. */}
            {item.action?.href ? (
              <Button
                size="sm"
                href={item.action.href}
                external
                className="ui-triage-action"
              >
                {item.action.label}
              </Button>
            ) : opens ? (
              <span className="ui-triage-chevron" aria-hidden="true">
                ›
              </span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
