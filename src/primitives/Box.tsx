import type { ReactNode } from "react"
import { cn } from "../cn"

export type BoxSurface = "surface" | "surface-2" | "transparent"
export type BoxPadding = "none" | "sm" | "md" | "lg"

interface Props {
  children?: ReactNode
  surface?: BoxSurface
  padding?: BoxPadding
  border?: boolean
  className?: string
}

const SURFACE_CLASS: Record<BoxSurface, string> = {
  surface: "ui-box--surface",
  "surface-2": "ui-box--surface-2",
  transparent: "ui-box--transparent",
}
const PADDING_CLASS: Record<BoxPadding, string> = {
  none: "ui-box--pad-none",
  sm: "ui-box--pad-sm",
  md: "ui-box--pad-md",
  lg: "ui-box--pad-lg",
}

export function Box({ children, surface = "surface", padding = "md", border = true, className }: Props) {
  return (
    <div className={cn("ui-box", SURFACE_CLASS[surface], PADDING_CLASS[padding], border && "ui-box--border", className)}>
      {children}
    </div>
  )
}
