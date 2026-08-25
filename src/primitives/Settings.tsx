import type { ReactNode } from "react"
import { cn } from "../cn"

/** Accessible on/off switch. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cn("ui-toggle", checked && "ui-toggle--on")}
      onClick={() => onChange(!checked)}
    >
      <span className="ui-toggle-knob" />
    </button>
  )
}

/** One settings line: what it is, what it does, the control. */
export function SettingRow({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-settingrow">
      <div className="ui-settingrow-text">
        <span className="ui-settingrow-label">{label}</span>
        {hint && <span className="ui-settingrow-hint">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

interface FieldProps {
  value: string
  onChange: (v: string) => void
  options?: Array<{ value: string; label: string }>
  placeholder?: string
  type?: string
}

export function TextField({ value, onChange, placeholder, type = "text" }: FieldProps) {
  return (
    <input
      className="ui-field"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function SelectField({ value, onChange, options }: FieldProps) {
  return (
    <select className="ui-field ui-field--select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options?.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export type ChipTone = "ok" | "stale" | "muted" | "danger"

const CHIP_TONES: Record<ChipTone, string> = {
  ok: "var(--ok)",
  stale: "var(--warn)",
  muted: "var(--muted)",
  danger: "var(--danger)",
}

/** Small status badge: Live, Stale, Cached… */
export function Chip({ tone = "muted", children }: { tone?: ChipTone; children: ReactNode }) {
  const color = CHIP_TONES[tone]
  return (
    <span className="ui-chipbadge" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
      {children}
    </span>
  )
}
