import { Component, type ErrorInfo, type ReactNode } from "react"
import { isStaleChunk } from "./chunk.js"
import { reportBoundaryError } from "./reporting.js"

export interface ErrorBoundaryFallbackProps {
  error: unknown
  /** Clear the error and render the children again. */
  reset: () => void
  /** The boundary's name, as reported. */
  name: string
}

export interface ErrorBoundaryProps {
  /** Which boundary caught it — "routes", "player-card". Sent with the report. */
  name: string
  /** Replaces the default fallback. A node, or a function given the error and a reset. */
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode)
  /** Called after "Try again" clears the error — clear whatever state broke it. */
  onReset?: () => void
  children?: ReactNode
}

interface State {
  error: unknown
  failed: boolean
}

/**
 * Catches a render error below it, reports it (kind: boundary, with the
 * component stack) and shows a way out instead of a blank page. A stale
 * chunk after a deploy reloads once instead, when installChunkReload() is on.
 *
 * Reporting is a no-op until initReporting() runs, so the boundary is safe to
 * use anywhere — the playground, tests, an app that has not wired reporting.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null, failed: false }

  static getDerivedStateFromError(error: unknown): State {
    return { error, failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    try {
      reportBoundaryError(this.props.name, error, info?.componentStack)
    } catch { /* never into the host app */ }
  }

  reset = () => {
    this.setState({ error: null, failed: false })
    try { this.props.onReset?.() } catch { /* the app's own reset failed; the boundary will catch what follows */ }
  }

  render() {
    if (!this.state.failed) return this.props.children
    const { fallback, name } = this.props
    const { error } = this.state
    try {
      if (typeof fallback === "function") return fallback({ error, reset: this.reset, name })
      if (fallback !== undefined) return fallback
    } catch { /* a broken custom fallback falls back to ours */ }
    return <CrashFallback error={error} onReset={this.reset} />
  }
}

const reload = () => {
  try { window.location.reload() } catch { /* nothing left to try */ }
}

/**
 * The default fallback. Works without ui.css: its own rules ride along in a
 * <style> tag under :where(), so they carry zero specificity — with the kit's
 * stylesheet loaded, ui.css and phosphor.css (the .ui-btn frame, the chrome
 * face) win; without it (Family Hub, NoFuss) these defaults stand, reading the
 * host's --text / --surface / --border when it has them and currentColor when
 * it does not.
 */
export function CrashFallback({ error, onReset }: { error: unknown; onReset?: () => void }) {
  const stale = isStaleChunk(error)
  const detail = describe(error)
  return (
    <div className="ui-crash" role="alert">
      <style>{CRASH_CSS}</style>
      <div className="ui-crash-card">
        <span className="ui-crash-icon" aria-hidden="true">
          <svg className="ui-crash-icon-line" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <svg className="ui-crash-icon-pixel" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d={PIXEL_WARNING} />
          </svg>
        </span>
        {/* A div with a heading role, not an h2: a host's own h2 rules (uppercase
            eyebrows, page margins) would otherwise restyle it. */}
        <div className="ui-crash-title" role="heading" aria-level={2}>
          {stale ? "A new version is ready" : "Something went wrong"}
        </div>
        <p className="ui-crash-msg">
          {stale
            ? "The app was updated while this page was open. Reload to pick up the new one."
            : "This part of the app hit a problem and stopped. Reloading usually fixes it."}
        </p>
        <div className="ui-crash-actions">
          <button type="button" className="ui-btn ui-btn--primary ui-crash-btn ui-crash-btn--primary" onClick={reload}>
            Reload
          </button>
          {!stale && onReset && (
            <button type="button" className="ui-btn ui-crash-btn ui-crash-btn--quiet" onClick={onReset}>
              Try again
            </button>
          )}
        </div>
        {!stale && detail && (
          <details className="ui-crash-details">
            <summary>Details</summary>
            <code>{detail}</code>
          </details>
        )}
      </div>
    </div>
  )
}

function describe(error: unknown): string {
  try {
    if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 400)
    if (typeof error === "string") return error.slice(0, 400)
    return ""
  } catch {
    return ""
  }
}

// Pixelarticons' warning-diamond, the icon Phosphor draws everywhere else.
const PIXEL_WARNING =
  "M2 10h2v2H2zm0 4h2v-2H2zm20-4h-2v2h2zm0 4h-2v-2h2zM4 8h2v2H4zm0 8h2v-2H4zm16-8h-2v2h2zm0 8h-2v-2h2zM6 6h2v2H6zm0 12h2v-2H6zM18 6h-2v2h2zm0 12h-2v-2h2zM8 4h2v2H8zm0 16h2v-2H8zm8-16h-2v2h2zm0 16h-2v-2h2zM10 2h2v2h-2zm0 20h2v-2h-2zm4-20h-2v2h2zm0 20h-2v-2h2zm-3-5h2v-2h-2zm0-4h2V7h-2z"

/* Tokens with fallbacks for a page that has none. color-mix over currentColor
   stands in for --border / --muted, so nothing here names a colour. */
const CRASH_CSS = `
:where(.ui-crash) {
  display: flex; justify-content: center;
  padding: var(--space-6, 2rem) var(--space-4, 1rem);
  color: var(--text, inherit);
}
:where(.ui-crash-card) {
  box-sizing: border-box; width: 100%; max-width: 26rem;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3, 0.75rem);
  padding: var(--space-6, 2rem) var(--space-5, 1.5rem) var(--space-5, 1.5rem);
  text-align: center;
  background: var(--surface, transparent);
  border: 1px solid var(--border, color-mix(in srgb, currentColor 18%, transparent));
  border-radius: var(--radius-lg, 14px);
  box-shadow: var(--shadow-md, none);
}
:where(.ui-crash-icon) {
  display: inline-flex; align-items: center; justify-content: center;
  width: 3rem; height: 3rem; border-radius: 999px;
  color: var(--sev-error, var(--danger, currentColor));
  background: color-mix(in srgb, currentColor 12%, transparent);
}
:where(.ui-crash-icon-pixel) { display: none; }
:where([data-skin="phosphor"]) :where(.ui-crash-icon-pixel) { display: block; }
:where([data-skin="phosphor"]) :where(.ui-crash-icon-line) { display: none; }
:where(.ui-crash-title) {
  margin: 0; font-family: var(--px-chrome, inherit);
  font-size: calc(1.125rem + var(--fs-bump, 0px)); font-weight: 650; line-height: 1.3;
  color: var(--text, inherit);
}
:where(.ui-crash-msg) {
  margin: 0; max-width: 22rem;
  font-size: calc(0.9375rem + var(--fs-bump, 0px)); line-height: 1.5;
  color: var(--text-2, var(--muted, inherit));
}
:where(.ui-crash-actions) {
  display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2, 0.5rem);
  margin-top: var(--space-2, 0.5rem);
}
:where(.ui-crash-btn) {
  box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; min-width: 7.5rem; padding: 0 var(--space-5, 1.5rem);
  border-radius: var(--radius-md, 10px);
  font: inherit; font-weight: 600; cursor: pointer;
  border: 1px solid var(--border-strong, color-mix(in srgb, currentColor 30%, transparent));
  background: transparent; color: var(--text, inherit);
}
/* With the kit's tokens: a filled brand button. Without them: a heavier
   outline in the text colour — currentColor can't fill a button whose own
   colour is the label, so the hierarchy comes from the frame instead. */
:where(.ui-crash-btn--primary) {
  border: 2px solid var(--brand, currentColor);
  background: var(--brand, transparent);
  color: var(--on-brand, inherit);
}
:where(.ui-crash-details) {
  width: 100%; margin-top: 0;
  font-size: calc(0.8125rem + var(--fs-bump, 0px));
  color: var(--muted, inherit);
}
:where(.ui-crash-details > summary) {
  cursor: pointer; display: inline-block; padding: var(--space-2, 0.5rem);
  min-height: 2rem; opacity: 0.85;
}
:where(.ui-crash-details > code) {
  display: block; margin-top: var(--space-2, 0.5rem); padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  text-align: left; white-space: pre-wrap; overflow-wrap: anywhere;
  max-height: 8rem; overflow: auto;
  font-family: var(--font-mono, ui-monospace, monospace); font-size: inherit;
  background: var(--surface-2, color-mix(in srgb, currentColor 6%, transparent));
  border-radius: var(--radius-sm, 6px);
}
`
