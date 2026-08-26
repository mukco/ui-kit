import { cn } from "../cn"
import { useRovingSelect } from "./useRovingSelect"

export interface TabItem {
  id: string
  label: string
}

interface Props {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}

/**
 * The horizontal tab strip every screen uses; wraps on phones.
 *
 * role="tablist" tells assistive tech this is one tab stop navigated with the
 * arrow keys. It said so and implemented neither, so a screen reader user was
 * told how the widget worked and then found it did not.
 */
export function Tabs({ tabs, active, onChange, className }: Props) {
  const onKeyDown = useRovingSelect(
    tabs.map((t) => t.id),
    active,
    onChange,
  )

  return (
    <div className={cn("ui-tabs", className)} role="tablist" onKeyDown={onKeyDown}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === active}
          // The other half of a roving tabindex: one stop for the group, and
          // it is whichever tab is current.
          tabIndex={t.id === active ? 0 : -1}
          type="button"
          className={cn("ui-tab", t.id === active && "ui-tab--active")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
