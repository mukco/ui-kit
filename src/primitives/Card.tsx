import type { ReactNode } from "react"
import { cn } from "../cn"

interface Props {
  children: ReactNode
  className?: string
  /** Render as a section with a title bar. */
  title?: ReactNode
}

/** The kit's basic surface: bordered, rounded, subtly elevated. */
export function Card({ children, className, title }: Props) {
  return (
    <section className={cn("ui-card", className)}>
      {title && (
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", color: "var(--text)" }}>{title}</h3>
      )}
      {children}
    </section>
  )
}
