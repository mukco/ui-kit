import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

/** One titled card of SettingRows — the unit baseball's settings page stacks.
    Compose groups under a PageHeader and you have the whole screen. */
export function SettingsGroup({ title, description, children, className }: Props) {
  return (
    <section className={cn("ui-card ui-settingsgroup", className)}>
      <header className="ui-settingsgroup-head">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div>{children}</div>
    </section>
  )
}
