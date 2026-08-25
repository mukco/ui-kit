import { cn } from "../cn"

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

/** The horizontal tab strip every screen uses; wraps on phones. */
export function Tabs({ tabs, active, onChange, className }: Props) {
  return (
    <div className={cn("ui-tabs", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === active}
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
