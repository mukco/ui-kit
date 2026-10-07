import type { ReactNode } from "react"
import { cn } from "../cn"

export type SettingsGroupTone = "brand" | "ok" | "warn" | "info"

interface Props {
  title: ReactNode
  description?: ReactNode
  /** A line icon in a tinted tile beside the title (baseball's settings look). */
  icon?: ReactNode
  tone?: SettingsGroupTone
  /** Status beside the title, e.g. a Chip saying "Set". */
  aside?: ReactNode
  children: ReactNode
  className?: string
}

/** One titled card of SettingRows — the unit baseball's settings page stacks.
    Compose groups under a PageHeader and you have the whole screen. */
export function SettingsGroup({ title, description, icon, tone = "brand", aside, children, className }: Props) {
  return (
    <section className={cn("ui-card ui-settingsgroup", className)}>
      <header className={cn("ui-settingsgroup-head", icon != null && "ui-settingsgroup-head--icon")}>
        {icon != null && <span className={`ui-settingsgroup-icon ui-settingsgroup-icon--${tone}`} aria-hidden="true">{icon}</span>}
        <div className="ui-settingsgroup-headtext">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {aside != null && <div className="ui-settingsgroup-aside">{aside}</div>}
      </header>
      <div>{children}</div>
    </section>
  )
}
