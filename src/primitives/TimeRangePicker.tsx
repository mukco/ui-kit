import { cn } from "../cn"
import { useRovingSelect } from "./useRovingSelect"

export interface TimeRangeOption {
  id: string
  label: string
  /** How far back this reaches. The caller decides what to do with it. */
  hours: number
}

export const DEFAULT_TIME_RANGES: TimeRangeOption[] = [
  { id: "1h", label: "1h", hours: 1 },
  { id: "6h", label: "6h", hours: 6 },
  { id: "24h", label: "24h", hours: 24 },
  { id: "7d", label: "7d", hours: 168 },
]

/**
 * One range, obeyed by every panel on the page.
 *
 * The spine of a monitoring screen: pick six hours here and the sparklines,
 * the charts and the counts all move together, so two panels are never quietly
 * describing two different afternoons. DateNav is the wrong shape for this —
 * it steps through days one at a time, which answers a different question.
 */
export function TimeRangePicker({
  value,
  onChange,
  ranges = DEFAULT_TIME_RANGES,
  className,
}: {
  value: string
  onChange: (range: TimeRangeOption) => void
  ranges?: TimeRangeOption[]
  className?: string
}) {
  // role="radiogroup" promises one tab stop and arrow-key navigation. It
  // promised both and provided neither.
  const onKeyDown = useRovingSelect(
    ranges.map((r) => r.id),
    value,
    (id) => {
      const picked = ranges.find((r) => r.id === id)
      if (picked) onChange(picked)
    },
  )

  return (
    <div
      className={cn("ui-range", className)}
      role="radiogroup"
      aria-label="Time range"
      onKeyDown={onKeyDown}
    >
      {ranges.map((range) => (
        <button
          key={range.id}
          type="button"
          role="radio"
          aria-checked={range.id === value}
          tabIndex={range.id === value ? 0 : -1}
          className={cn("ui-range-opt", range.id === value && "is-on")}
          onClick={() => onChange(range)}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
