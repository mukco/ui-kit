import { useId, type ReactNode } from "react"
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
  /**
   * What is wrong with the current value, in words the person can act on.
   *
   * The kit had no way to say this at all, so every app either invented its
   * own or — far more often — showed nothing and let the submit fail. When set,
   * the field is marked invalid, described by the message, and the message is
   * announced: colour alone would leave the whole thing invisible to anybody
   * not looking straight at it.
   *
   * Say what to do, not that something is wrong. "Use a number of minutes"
   * beats "Invalid input".
   */
  error?: string
  /** Ties the field to its own error text. Supply one when two fields with the
      same label can appear on a page. */
  id?: string
}

export function TextField({ value, onChange, placeholder, type = "text", error, id }: FieldProps) {
  const auto = useId()
  const fieldId = id ?? auto
  const errorId = `${fieldId}-error`

  return (
    <>
      <input
        id={fieldId}
        className={cn("ui-field", error && "ui-field--invalid")}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </>
  )
}

export function SelectField({ value, onChange, options, error, id }: FieldProps) {
  const auto = useId()
  const fieldId = id ?? auto
  const errorId = `${fieldId}-error`

  return (
    <>
      <select
        id={fieldId}
        className={cn("ui-field ui-field--select", error && "ui-field--invalid")}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </>
  )
}

/**
 * The message under an invalid field.
 *
 * role="alert" because validation usually appears after the reader has moved
 * on — they submitted, or left the field — and a message that only exists
 * visually is one they will never learn about. The ⚠ is decorative; the text
 * carries it, and aria-describedby ties it to the field it is about.
 */
function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="ui-field-error" id={id} role="alert">
      <span aria-hidden="true">⚠</span> {children}
    </p>
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
export function Chip({
  tone = "muted",
  children,
  onClick,
  title,
}: {
  tone?: ChipTone
  children: ReactNode
  /** Makes the chip a door. A named thing that can be opened should be
      openable — the alternative keeps coming out as a comma-separated list of
      places to go with no way to reach any of them. */
  onClick?: () => void
  title?: string
}) {
  /*
   * The component names the hue; the stylesheet decides how to render it.
   *
   * This used to set both halves inline: color: var(--ok) on a 12% wash of
   * var(--ok) — the same colour as text on a tint of itself, which measured
   * 3.6–4.3:1 and failed AA on every tab that shows a chip. It is the same
   * defect the estate panel's count badge had, and inline styles meant no
   * stylesheet could correct it.
   *
   * Passing the hue as a custom property lets ui.css darken the text in light
   * and lighten it in dark, which is the only way one tint can work in both.
   */
  const style = { ["--chip-hue" as string]: CHIP_TONES[tone] }

  if (onClick) {
    return (
      <button type="button" className="ui-chipbadge ui-chipbadge--button" style={style} onClick={onClick} title={title}>
        {children}
      </button>
    )
  }

  return (
    <span className="ui-chipbadge" style={style} title={title}>
      {children}
    </span>
  )
}
