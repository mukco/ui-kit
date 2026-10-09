/**
 * The event the browser sends to its app's POST /internal/errors — the shape
 * in the estate observability contract, section 1. Pure: no window, no
 * storage, so the node tests can drive it directly.
 */
export type Level = "error" | "warning" | "info"
export type Source = "client" | "tv"
export type Kind =
  | "boundary"
  | "onerror"
  | "unhandledrejection"
  | "watchdog"
  | "session_died"
  | "chunk"
  | "manual"
  | "log"
  | "console"
  | "network"
  | "boot"

/** Small key/values that travel with an event. ≤ 8 KB serialized. */
export interface ReportContext {
  kind?: Kind
  route?: string
  component_stack?: string
  breadcrumbs?: string[]
  build?: string
  ua?: string
  screen?: string
  online?: boolean
  /** A custom grouping key. Lifted onto the event, not sent as context. */
  fingerprint?: string
  [key: string]: unknown
}

export interface ReportEvent {
  event_id: string
  level: Level
  source: Source
  message: string
  error_class?: string
  stack?: string
  fingerprint?: string
  occurred_at: string
  context: ReportContext
}

export const LIMITS = {
  message: 1000,
  errorClass: 200,
  stack: 16 * 1024,
  fingerprint: 200,
  context: 8 * 1024,
  breadcrumbs: 20,
} as const

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s)

/** What an Error, a string, or whatever was thrown says about itself. */
export function describeThrown(thrown: unknown): { message: string; error_class?: string; stack?: string } {
  try {
    if (thrown instanceof Error || (thrown && typeof thrown === "object" && "message" in thrown)) {
      const e = thrown as { name?: unknown; message?: unknown; stack?: unknown }
      const message = String(e.message ?? "") || String(e.name ?? "") || "Error"
      return {
        message,
        error_class: typeof e.name === "string" && e.name ? e.name : undefined,
        stack: typeof e.stack === "string" ? e.stack : undefined,
      }
    }
    if (typeof thrown === "string") return { message: thrown }
    if (thrown === undefined || thrown === null) return { message: String(thrown) }
    let text: string
    try { text = JSON.stringify(thrown) ?? String(thrown) } catch { text = String(thrown) }
    return { message: text, error_class: typeof thrown }
  } catch {
    return { message: "Unreadable error" }
  }
}

/**
 * The same text for the same bug: numbers, hex ids, UUIDs and quoted strings
 * become placeholders, so "row 41 missing" and "row 42 missing" count as one.
 * The estate normalizes again on its side; this is only for client dedupe.
 */
export function normalizeMessage(message: string): string {
  return message
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<uuid>")
    .replace(/(["'`])(?:(?!\1).){0,200}\1/g, "<str>")
    .replace(/\b0x[0-9a-f]+\b|\b[0-9a-f]{8,}\b/gi, "<hex>")
    .replace(/\d+(\.\d+)?/g, "<n>")
    .trim()
}

/** The first frame of a stack, without the build hash or line/column. */
export function topFrame(stack: string | undefined): string {
  if (!stack) return ""
  for (const raw of stack.split("\n")) {
    const line = raw.trim()
    // V8: "at fn (url:1:2)"; WebKit/Gecko: "fn@url:1:2".
    if (!(line.startsWith("at ") || line.includes("@"))) continue
    return line
      .replace(/^at\s+/, "")
      .replace(/:\d+(:\d+)?\)?$/, "")
      .replace(/https?:\/\/[^/\s]+/, "")
      .replace(/[-.][0-9a-zA-Z_]{8,}(\.(m?js|css))/, "$1")
  }
  return ""
}

/** Client-side grouping key: custom when given, else level + class + message + top frame. */
export function fingerprintOf(e: Pick<ReportEvent, "level" | "message" | "error_class" | "stack" | "fingerprint">): string {
  if (e.fingerprint) return e.fingerprint
  return [e.level, e.error_class ?? "", normalizeMessage(e.message), topFrame(e.stack)].join("|")
}

export function newEventId(): string {
  try {
    const c = (globalThis as { crypto?: Crypto }).crypto
    if (c && typeof c.randomUUID === "function") return c.randomUUID()
  } catch { /* insecure context */ }
  const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${hex(3)}-${hex(12)}`
}

/** Fit the context under the contract's 8 KB, shedding the bulkiest parts first. */
export function fitContext(ctx: ReportContext): ReportContext {
  const size = (c: ReportContext) => { try { return JSON.stringify(c).length } catch { return Infinity } }
  let out: ReportContext = { ...ctx }
  if (Array.isArray(out.breadcrumbs) && out.breadcrumbs.length > LIMITS.breadcrumbs) {
    out.breadcrumbs = out.breadcrumbs.slice(-LIMITS.breadcrumbs)
  }
  if (size(out) <= LIMITS.context) return out
  if (typeof out.component_stack === "string") out.component_stack = clip(out.component_stack, 2000)
  if (size(out) <= LIMITS.context) return out
  if (Array.isArray(out.breadcrumbs)) out.breadcrumbs = out.breadcrumbs.slice(-8).map((b) => clip(String(b), 120))
  if (size(out) <= LIMITS.context) return out
  // Something an app added is too big. Keep the fields everyone relies on.
  const keep: (keyof ReportContext)[] = ["kind", "route", "breadcrumbs", "build", "ua", "screen", "online"]
  out = Object.fromEntries(keep.filter((k) => k in out).map((k) => [k, out[k]])) as ReportContext
  out.context_truncated = true
  if (size(out) <= LIMITS.context) return out
  return { kind: ctx.kind, context_truncated: true }
}

export interface BuildEventInput {
  level: Level
  source: Source
  thrown: unknown
  context?: ReportContext
  base?: ReportContext
  now?: number
}

/** One event, fields clipped to the contract's sizes. */
export function buildEvent({ level, source, thrown, context = {}, base = {}, now = Date.now() }: BuildEventInput): ReportEvent {
  const d = describeThrown(thrown)
  const { fingerprint, ...rest } = context
  const ev: ReportEvent = {
    event_id: newEventId(),
    level,
    source,
    message: clip(d.message || "(no message)", LIMITS.message),
    occurred_at: new Date(now).toISOString(),
    context: fitContext({ kind: "manual", ...base, ...rest }),
  }
  if (d.error_class) ev.error_class = clip(d.error_class, LIMITS.errorClass)
  if (d.stack) ev.stack = clip(d.stack, LIMITS.stack)
  if (typeof fingerprint === "string" && fingerprint) ev.fingerprint = clip(fingerprint, LIMITS.fingerprint)
  return ev
}
