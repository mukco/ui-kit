import { useRef, type ReactNode } from "react"
import { cn } from "../cn"
import { useFocusTrap } from "./useFocusTrap"

interface Props {
  open: boolean
  /** What is about to happen, as a heading. "Reboot the gateway?" */
  title: string
  /** The consequence, in a sentence. What a careful person would want to know
      before saying yes — how long it takes, what goes down, what cannot be
      undone. Omitting it makes this a speed bump rather than a decision. */
  children?: ReactNode
  /** Names the action, never "OK". A button that says "Reboot" is one a reader
      can check against the heading; "OK" can only be checked against memory. */
  confirmLabel?: string
  cancelLabel?: string
  /** Paints the confirm button as destructive. */
  destructive?: boolean
  /** Disables the confirm button and says so, for the in-flight moment. */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

/**
 * Are you sure, for the things that cannot be taken back.
 *
 * The kit had no confirmation primitive at all, in an estate whose panel
 * reboots containers and runs SQL — so each consuming app either invented its
 * own or, more often, did the irreversible thing on a single click. That is
 * the divergence a shared kit exists to prevent, and it is the case where
 * divergence costs the most.
 *
 * Cancel is focused first, not confirm. Someone who opened this by accident
 * should be one Return away from nothing happening, and Escape does the same.
 * The dangerous button is never the default.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  busy,
  onConfirm,
  onCancel,
  className,
}: Props) {
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(open, panel, onCancel)

  if (!open) return null

  return (
    <div className="ui-confirm-overlay" onClick={onCancel}>
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn("ui-confirm", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="ui-confirm-title">{title}</h2>
        {children && <div className="ui-confirm-body">{children}</div>}
        <div className="ui-confirm-actions">
          {/* First in the DOM so the focus trap lands here, and so Tab reaches
              the safe choice before the unsafe one. */}
          <button type="button" className="ui-confirm-cancel" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn("ui-confirm-go", destructive && "ui-confirm-go--danger")}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
