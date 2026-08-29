import type { ReactNode } from "react"
import { cn } from "../cn"

export type TextSize = "sm" | "md" | "lg" | "xl"
export type TextTone = "default" | "muted" | "brand"
export type TextWeight = "normal" | "medium" | "bold"

const SIZE_CLASS: Record<TextSize, string> = {
  sm: "ui-text--sm",
  md: "ui-text--md",
  lg: "ui-text--lg",
  xl: "ui-text--xl",
}
const TONE_CLASS: Record<TextTone, string> = {
  default: "ui-text--default",
  muted: "ui-text--muted",
  brand: "ui-text--brand",
}
const WEIGHT_CLASS: Record<TextWeight, string> = {
  normal: "ui-text--normal",
  medium: "ui-text--medium",
  bold: "ui-text--bold",
}

interface Props {
  children: ReactNode
  size?: TextSize
  tone?: TextTone
  weight?: TextWeight
  className?: string
}

export function Text({ children, size = "md", tone = "default", weight = "normal", className }: Props) {
  return <p className={cn("ui-text", SIZE_CLASS[size], TONE_CLASS[tone], WEIGHT_CLASS[weight], className)}>{children}</p>
}
