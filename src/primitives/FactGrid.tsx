import type { ReactNode } from "react"
import { cn } from "../cn"

export interface Fact {
  label: string
  /** Omitted entirely when null or undefined — a blank row is worse than none. */
  value?: ReactNode
  /** Render the value in mono: an image tag, a sha, a container name. */
  mono?: boolean
}

/**
 * Dense label/value pairs — what a thing *is*, as against how it is doing.
 *
 * Exists because the alternative keeps happening: the same facts get joined
 * with commas into a sentence, which reads as prose, cannot be scanned, and
 * gives the eye nowhere to land. A grid gives every value the same starting
 * column, so "which image is this on" is answered by looking rather than
 * reading.
 */
export function FactGrid({ facts, className }: { facts: Fact[]; className?: string }) {
  const shown = facts.filter((f) => f.value != null && f.value !== "")
  if (shown.length === 0) return null

  return (
    <dl className={cn("ui-facts", className)}>
      {shown.map((fact) => (
        <div key={fact.label} className="ui-facts-row">
          <dt>{fact.label}</dt>
          <dd className={cn(fact.mono && "ui-facts-mono")}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
