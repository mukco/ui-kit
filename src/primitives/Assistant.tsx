import { useState, type ReactNode } from "react"
import { cn } from "../cn"

export interface ChatMessage {
  role: "user" | "assistant"
  content: ReactNode
}

interface Props {
  /** Panel heading. */
  title?: string
  messages: ChatMessage[]
  busy?: boolean
  onSend: (text: string) => void
  /** FAB label when closed (emoji or short glyph). */
  launcher?: ReactNode
  className?: string
}

/**
 * Floating assistant: a launcher bubble that opens a small chat panel.
 * The kit renders the conversation and input; the app decides what sending
 * a message actually does.
 */
export function Assistant({ title = "Assistant", messages, busy = false, onSend, launcher = "✨", className }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")

  function submit() {
    const text = draft.trim()
    if (!text || busy) return
    onSend(text)
    setDraft("")
  }

  return (
    <div className={cn("ui-assistant-root", className)}>
      {open && (
        <div className="ui-assistant-panel">
          <header className="ui-assistant-head">
            <span>{title}</span>
            <button type="button" aria-label="Close assistant" className="ui-assistant-close" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>
          <div className="ui-assistant-log">
            {messages.length === 0 && <p className="ui-assistant-empty">Ask anything.</p>}
            {messages.map((m, i) => (
              <div key={i} className={`ui-msg ui-msg--${m.role}`}>
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="ui-msg ui-msg--assistant">
                <span className="ui-spinner" style={{ width: 12, height: 12 }} />
              </div>
            )}
          </div>
          <footer className="ui-assistant-inputrow">
            <input
              className="ui-assistant-input"
              value={draft}
              placeholder="Type…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button type="button" className="ui-assistant-send" onClick={submit} disabled={busy}>
              Send
            </button>
          </footer>
        </div>
      )}
      {!open && (
        <button type="button" className="ui-assistant-fab" aria-label="Open assistant" onClick={() => setOpen(true)}>
          {launcher}
        </button>
      )}
    </div>
  )
}
