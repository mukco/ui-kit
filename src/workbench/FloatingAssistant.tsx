import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

const MIN_OPACITY = 0.25
const DEFAULT_OPACITY = 0.9
// Used only to pick touch-friendly starting sizes. The panel is a floating,
// draggable, resizable window at every width — it is not a mode.
export const MOBILE_BREAKPOINT = 640

export function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
}

// `available` is the visual-viewport height, passed only while the on-screen
// keyboard is up. The panel used to become a full-screen sheet on a phone, and
// that is what hid the send button: the sheet is 100dvh, dvh does not shrink
// for the keyboard, so the composer sat underneath it with nothing to scroll.
// Now the panel is clamped into whatever the keyboard leaves visible.
export function panelGeometry({ position, width, height, available }: any) {
  // The floor is the panel's own height, not MIN_HEIGHT: this clamp exists to
  // shrink a panel into the visible strip, and must never grow one the user
  // already made smaller.
  const floor = Math.min(MIN_HEIGHT, height)
  const h = available ? Math.max(floor, Math.min(height, available - 16)) : height
  const top = available
    ? Math.max(8, Math.min(position.y, available - h - 8))
    : position.y

  return {
    left: position.x,
    top,
    width,
    height: h,
    maxWidth: "calc(100vw - 16px)",
    maxHeight: "calc(100dvh - 16px)",
  }
}

const DEFAULT_WIDTH = 400
const MIN_WIDTH = 340
const MAX_WIDTH = 640
const MIN_HEIGHT = 320
const MAX_HEIGHT = 900
const PANEL_H_EST = 560 // height estimate used for clamping before the panel measures itself
const EDGE_MARGIN = 24
const MAX_SESSIONS = 30

// A 340px floor is comfortable on a laptop and impossible on a 320px phone,
// where it would forbid resizing below the screen width.
function minWidth() {
  return Math.min(MIN_WIDTH, Math.max(240, window.innerWidth - 16))
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

// `welcome` carries a marker so history sent to `onAsk` can drop it without
// relying on object identity, which does not survive a JSON round trip
// through localStorage.
function blankSession(welcome: string) {
  return { id: genId(), title: null, messages: [{ role: "assistant", text: welcome, welcome: true }], createdAt: Date.now() }
}

function loadSessions(prefix: string, welcome: string) {
  try {
    const raw = localStorage.getItem(`${prefix}-sessions`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    // Migrate an app's old single-history format, if it shipped one under this prefix.
    const oldRaw = localStorage.getItem(`${prefix}-history`)
    if (oldRaw) {
      const msgs = JSON.parse(oldRaw)
      if (Array.isArray(msgs) && msgs.length > 1) {
        const firstUser = msgs.find((m: any) => m.role === "user")
        return [{ id: genId(), title: firstUser?.text?.slice(0, 50) ?? null, messages: msgs, createdAt: Date.now() }]
      }
    }
  } catch {
    /* ignore */
  }
  return [blankSession(welcome)]
}

function loadActiveId(prefix: string, sessions: any) {
  try {
    const id = localStorage.getItem(`${prefix}-active`)
    if (id && sessions.find((s: any) => s.id === id)) return id
  } catch {
    /* ignore */
  }
  return sessions[0]?.id ?? null
}

function fmtSessionDate(ts: any) {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" })
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function loadWidth(prefix: string) {
  try {
    const raw = window.localStorage.getItem(`${prefix}-width`)
    const parsed = Number(raw)
    // `raw` must be checked separately: Number(null) is 0, and 0 is finite, so
    // testing only the parsed number made this branch run with nothing stored
    // and pinned every first load to MIN_WIDTH.
    if (raw !== null && Number.isFinite(parsed) && parsed > 0) {
      const viewportCap = Math.floor(window.innerWidth * (isMobileViewport() ? 0.94 : 0.55))
      return Math.min(Math.min(MAX_WIDTH, viewportCap), Math.max(minWidth(), parsed))
    }
  } catch {
    // ignore
  }
  return isMobileViewport()
    ? Math.max(minWidth(), Math.floor(window.innerWidth * 0.94))
    : DEFAULT_WIDTH
}

function loadMinimized(prefix: string) {
  try {
    // Default to minimized (bubble) on first ever load.
    return window.localStorage.getItem(`${prefix}-minimized`) !== "false"
  } catch {
    return true
  }
}

function loadHeight(prefix: string) {
  const cap = Math.min(MAX_HEIGHT, Math.floor(window.innerHeight * 0.92))
  try {
    const parsed = Number(window.localStorage.getItem(`${prefix}-height`))
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(cap, Math.max(MIN_HEIGHT, parsed))
    }
  } catch {
    /* ignore */
  }
  // 0.62 on a phone rather than 0.7: the on-screen keyboard eats roughly the
  // bottom 45%, and a panel that opens already taller than that starts its life
  // needing to be dragged.
  const mobile = isMobileViewport()
  const share = mobile ? 0.62 : 0.7
  // 560 is a comfortable desktop floor. On a phone it overrides the share
  // outright and puts the composer back under the keyboard.
  const floor = mobile ? MIN_HEIGHT : 560
  return Math.min(cap, Math.max(MIN_HEIGHT, Math.round(window.innerHeight * share), floor))
}

function loadOpacity(prefix: string) {
  try {
    const raw = window.localStorage.getItem(`${prefix}-opacity`)
    // Same trap as loadWidth: Number(null) is 0 and 0 is finite, so this
    // returned Math.max(MIN_OPACITY, 0) — every first-ever open of the panel
    // came up at 25% opacity, the most transparent setting there is, and
    // DEFAULT_OPACITY was never reached.
    if (raw !== null) {
      const parsed = Number(raw)
      if (Number.isFinite(parsed) && parsed > 0) return Math.min(1, Math.max(MIN_OPACITY, parsed))
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_OPACITY
}

export function clampPosition(x: any, y: any, w: any, h: any) {
  const maxX = Math.max(0, window.innerWidth - w)
  const maxY = Math.max(0, window.innerHeight - h)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}

// `height` is the height the panel will actually open at. It used to clamp
// against PANEL_H_EST regardless, and on a phone — where the opening height is
// a share of the screen rather than a constant — a 600px panel was positioned
// as though it were 560px and hung 40px off the bottom, taking the composer
// and the resize grips with it.
function loadPosition(prefix: string, width: any, height?: any) {
  const w = width || DEFAULT_WIDTH
  const h = height || PANEL_H_EST
  try {
    const raw = window.localStorage.getItem(`${prefix}-position`)
    if (raw) {
      const p = JSON.parse(raw)
      if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) {
        return clampPosition(p.x, p.y, w, h)
      }
    }
  } catch {
    /* ignore */
  }
  // Default: bottom-center of the viewport.
  return clampPosition(
    Math.round((window.innerWidth - w) / 2),
    window.innerHeight - h - EDGE_MARGIN,
    w,
    h,
  )
}

interface MentionResult {
  id: any
  name: string
  kind: string
}

function AssistantComposer({ onSubmit, isPending, prefill, onPrefillConsumed, mentionSearch, placeholder }: any) {
  const [question, setQuestion] = useState("")
  const [mentions, setMentions] = useState<any[]>([])
  const [mentionResults, setMentionResults] = useState<MentionResult[]>([])
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionIdx, setMentionIdx] = useState(-1)
  const inputRef = useRef<any>(null)
  const searchTimeout = useRef<any>(null)

  useEffect(() => {
    if (prefill) {
      setQuestion(prefill)
      onPrefillConsumed?.()
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [prefill]) // eslint-disable-line react-hooks/exhaustive-deps

  function detectMention(value: string, cursorPos: number) {
    const before = value.slice(0, cursorPos)
    const atIdx = before.lastIndexOf("@")
    if (atIdx === -1) return null
    const after = before.slice(atIdx + 1)
    if (after.includes(" ")) return null
    return { start: atIdx, query: after }
  }

  function handleChange(e: any) {
    const raw = e.target.value
    setQuestion(raw)
    if (!mentionSearch) return

    const cursorPos = e.target.selectionStart
    const mention = detectMention(raw, cursorPos)

    if (mention) {
      setMentionOpen(true)

      if (searchTimeout.current) clearTimeout(searchTimeout.current)
      searchTimeout.current = setTimeout(async () => {
        const q = mention.query.trim()
        if (q.length < 1) {
          setMentionResults([])
          return
        }
        try {
          const results = await mentionSearch(q)
          setMentionResults(results || [])
          setMentionIdx(-1)
        } catch {
          setMentionResults([])
        }
      }, 200)
    } else {
      setMentionOpen(false)
      setMentionResults([])
      setMentionIdx(-1)
    }
  }

  function selectMention(result: MentionResult) {
    const cursorPos = inputRef.current?.selectionStart ?? question.length
    const before = question.slice(0, cursorPos)
    const atIdx = before.lastIndexOf("@")
    if (atIdx === -1) return

    const after = question.slice(cursorPos)
    const newText = before.slice(0, atIdx) + "@" + result.name + " " + after
    setQuestion(newText)
    setMentions((prev) => [...prev.filter((m) => m.name !== result.name), { name: result.name, kind: result.kind, id: result.id }])
    setMentionOpen(false)
    setMentionResults([])
    setMentionIdx(-1)

    setTimeout(() => {
      if (inputRef.current) {
        const pos = atIdx + result.name.length + 2
        inputRef.current.focus()
        inputRef.current.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  function handleKeyDown(e: any) {
    if (!mentionOpen || mentionResults.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setMentionIdx((prev: number) => (prev + 1) % mentionResults.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setMentionIdx((prev: number) => (prev <= 0 ? mentionResults.length - 1 : prev - 1))
    } else if (e.key === "Enter" && mentionIdx >= 0) {
      e.preventDefault()
      selectMention(mentionResults[mentionIdx])
    } else if (e.key === "Escape") {
      setMentionOpen(false)
      setMentionResults([])
      setMentionIdx(-1)
    }
  }

  function submit(e: any) {
    e.preventDefault()
    const q = question.trim()
    if (!q || isPending) return
    setQuestion("")
    setMentions([])
    setMentionOpen(false)
    setMentionResults([])
    if (inputRef.current) inputRef.current.style.height = "auto"
    onSubmit({ text: q, mentions: [...mentions] })
  }

  function handleTextareaChange(e: any) {
    handleChange(e)
    const ta = e.target
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }

  function handleTextareaKeyDown(e: any) {
    if (e.key === "Enter" && !e.shiftKey) {
      if (mentionOpen && mentionIdx >= 0 && mentionResults.length > 0) {
        e.preventDefault()
        selectMention(mentionResults[mentionIdx])
        return
      }
      e.preventDefault()
      submit(e)
      return
    }
    handleKeyDown(e)
  }

  return (
    <form onSubmit={submit} className="ui-fa-composer">
      {mentionOpen && mentionResults.length > 0 && (
        <div className="ui-fa-mention-panel">
          {mentionResults.map((result, idx) => (
            <button
              key={`${result.kind}-${result.id}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); selectMention(result) }}
              className={`ui-fa-mention-item${idx === mentionIdx ? " ui-fa-mention-item--active" : ""}`}
            >
              <span className={`ui-fa-mention-glyph ${result.kind === "player" ? "ui-fa-mention-glyph--player" : "ui-fa-mention-glyph--team"}`}>
                {result.kind === "player" ? "@" : "#"}
              </span>
              <span className="ui-fa-mention-name">{result.name}</span>
              {result.kind && <span className="ui-fa-mention-meta">· {result.kind}</span>}
            </button>
          ))}
        </div>
      )}
      <div className="ui-fa-composer-fieldwrap">
        <textarea
          ref={inputRef}
          value={question}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          placeholder={placeholder}
          rows={1}
          className="ui-fa-textarea"
          style={{ minHeight: "48px", maxHeight: "200px", overflowY: "auto" }}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !question.trim()}
        title="Send"
        aria-label="Send"
        className="ui-fa-send-btn"
      >
        {isPending ? (
          <div className="ui-spinner" />
        ) : (
          <svg className="ui-fa-send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
          </svg>
        )}
      </button>
    </form>
  )
}

function extractSqlFromMessage(m: any) {
  const match = m.text?.match(/```sql\s*([\s\S]+?)```/)
  return match ? match[1].trim() : null
}

function AssistantMessage({ m, renderMarkdown, renderChart, messageActions, onOpenSandbox }: any) {
  const extractedSql = useMemo(() => extractSqlFromMessage(m), [m])
  const hasText = (m.text ?? "").trim().length > 0
  const hasCharts = m.charts?.length > 0
  const hasTools = m.tools?.length > 0
  const showActions = hasText && (Boolean(extractedSql && onOpenSandbox) || Boolean(messageActions))

  return (
    <>
      {hasText && (
        <div className="ui-fa-bubble-assistant">
          {renderMarkdown ? renderMarkdown(m.text) : <div className="ui-fa-plaintext">{m.text}</div>}
        </div>
      )}
      {!hasText && !hasCharts && hasTools && (
        <div className="ui-fa-bubble-tools">
          Used {m.tools.length} tool{m.tools.length !== 1 ? "s" : ""}
        </div>
      )}
      {showActions && (
        <div className="ui-fa-msg-actions">
          {extractedSql && onOpenSandbox && (
            <button
              type="button"
              onClick={() => onOpenSandbox(extractedSql)}
              className="ui-fa-loadsql-btn"
            >
              Load in Sandbox ↗
            </button>
          )}
          {messageActions?.(m)}
        </div>
      )}
      {hasCharts && (
        <div className="ui-fa-charts">
          {m.charts.map((chart: any, i: number) => (
            <div key={i} className="ui-fa-chart-card">
              {renderChart ? renderChart(chart) : (chart.title ?? chart.type ?? "Chart")}
            </div>
          ))}
        </div>
      )}
      {hasTools && (
        <details className="ui-fa-tools" open={!hasText}>
          <summary className="ui-fa-tools-summary">Tools used ({m.tools.length})</summary>
          <div className="ui-fa-tools-list">
            {m.tools.map((t: any, i: number) => (
              <div key={i} className="ui-fa-tool-row">{t.tool}</div>
            ))}
          </div>
        </details>
      )}
    </>
  )
}

export interface FloatingAssistantProps {
  /** The route the app is currently on. Passed through to `deriveContext` on
   *  every ask, so a route-driven context stays in sync with navigation. */
  pathname: string
  /** Maps the current route to a context object merged into every ask. Called
   *  fresh at ask time (not memoized away), so a closure over other live app
   *  state — a SQL sandbox's current query, say — stays current. `: any`
   *  because the shape is entirely the app's. */
  deriveContext: (pathname: string) => any
  /** The app's own API call. Receives the question text, the built context,
   *  and the prior message history (the welcome message excluded). Resolves
   *  to `{ answer, tools?, charts? }` — shape is the app's, hence `: any`. */
  onAsk: (question: string, context: any, history: any[]) => Promise<any>
  /** Panel title, launcher label, and the default session title. */
  title?: string
  welcome?: string
  /** localStorage keys are `${storagePrefix}-position`, `-sessions`, etc. */
  storagePrefix: string
  /** Drives the `@mention` autocomplete in the composer. Absent → no mention UI. */
  mentionSearch?: (query: string) => Promise<MentionResult[]>
  /** Renders a message's text (markdown, links, syntax highlighting — the
   *  app's choice). Absent → plain text. */
  renderMarkdown?: (text: string) => ReactNode
  /** Renders one chart payload. Absent → its title as plain text. */
  renderChart?: (chart: any) => ReactNode
  /** Extra per-message buttons, appended after the built-in "Load in
   *  Sandbox" action — e.g. a "Save to Obsidian" button. */
  messageActions?: (message: any) => ReactNode
  /** Called with a fenced ```sql block's contents when the user clicks "Load
   *  in Sandbox" on a message. Absent → the button doesn't render. */
  onOpenSandbox?: (sql: string) => void
  /** External signal to expand the panel — e.g. a page's own "ask" control. */
  open?: boolean
  /** Auto-asks a question — optionally with a context override — in the
   *  current session, e.g. when a long-running job elsewhere in the app
   *  finishes and the result should be explained without the user asking.
   *  Consumed once. */
  autoAsk?: { initialMessage: string; context?: any } | null
  onAutoAskConsumed?: () => void
  /** Runs a prompt in a brand-new session — e.g. "open in chat" from a
   *  notification. Consumed once. */
  pendingPrompt?: string | null
  onPendingPromptConsumed?: () => void
  /** Drops text into the composer without submitting it — e.g. a SQL
   *  workbench cell's "Ask assistant" button. The user can still edit before
   *  sending. Consumed once. */
  prefillPrompt?: string | null
  onPrefillPromptConsumed?: () => void
}

export function FloatingAssistant({
  pathname,
  deriveContext,
  onAsk,
  title = "Assistant",
  welcome = "Ask me anything about the page you are viewing.",
  storagePrefix,
  mentionSearch,
  renderMarkdown,
  renderChart,
  messageActions,
  onOpenSandbox,
  open,
  autoAsk,
  onAutoAskConsumed,
  pendingPrompt,
  onPendingPromptConsumed,
  prefillPrompt,
  onPrefillPromptConsumed,
}: FloatingAssistantProps) {
  const context = useMemo(() => ({ ...deriveContext(pathname), pathname }), [pathname, deriveContext])

  const [sessions, setSessions] = useState<any>(() => loadSessions(storagePrefix, welcome))
  const [activeId, setActiveId] = useState(() => loadActiveId(storagePrefix, loadSessions(storagePrefix, welcome)))
  const [sessionPanelOpen, setSessionPanel] = useState(false)
  const [width, setWidth] = useState(() => loadWidth(storagePrefix))
  const [height, setHeight] = useState(() => loadHeight(storagePrefix))
  const [composerPrefill, setComposerPrefill] = useState<any>(null)
  const [minimized, setMinimized] = useState(() => loadMinimized(storagePrefix))
  const [position, setPosition] = useState(() => loadPosition(storagePrefix, loadWidth(storagePrefix), loadHeight(storagePrefix)))
  // Non-null only while the on-screen keyboard is up, holding the height it
  // leaves visible. It is deliberately not `height`: `height` is persisted, and
  // a keyboard must not permanently shrink the panel the user sized.
  const [keyboardH, setKeyboardH] = useState<any>(null)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [opacity, setOpacity] = useState(() => loadOpacity(storagePrefix))
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<any>(null)
  const bottomRef = useRef<any>(null)
  const panelRef = useRef<any>(null)
  const resizeStateRef = useRef<any>(null)
  const dragStateRef = useRef<any>(null)
  const prevOpenRef = useRef(open)
  // Stores a notification prompt between the createSession() call and the next render
  // cycle (when activeId changes and messages reflects the blank session).
  const pendingNotifRef = useRef<any>(null)

  // The on-screen keyboard shrinks the *visual* viewport. It does not shrink
  // 100dvh and it does not fire `resize` on window, so nothing here noticed it
  // and the composer slid underneath the keyboard the moment you tapped the
  // input. The 80px slack keeps browser-chrome collapse from reading as a
  // keyboard.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const sync = () => setKeyboardH(vv.height < window.innerHeight - 80 ? vv.height : null)
    sync()
    vv.addEventListener("resize", sync)
    return () => vv.removeEventListener("resize", sync)
  }, [])

  // Keep the panel/bubble on-screen and the size within the viewport when it resizes.
  useEffect(() => {
    const handler = () => {
      setWidth((w: number) => Math.min(w, Math.floor(window.innerWidth * 0.92)))
      setHeight((h: number) => Math.min(h, Math.floor(window.innerHeight * 0.92)))
      setPosition((p: any) => clampPosition(p.x, p.y, width, panelRef.current?.offsetHeight ?? height))
    }
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [width, height])

  // When the app drives `open` true, expand the panel.
  useEffect(() => {
    if (open && !prevOpenRef.current) setMinimized(false)
    prevOpenRef.current = open
  }, [open])

  const activeSession = sessions.find((s: any) => s.id === activeId) ?? sessions[0]
  const messages = activeSession?.messages ?? [{ role: "assistant", text: welcome, welcome: true }]

  function setMessages(updater: any) {
    setSessions((prev: any) => prev.map((s: any) => {
      if (s.id !== activeSession?.id) return s
      const next = typeof updater === "function" ? updater(s.messages) : updater
      // Auto-title from first user message
      const nextTitle = s.title ?? next.find((m: any) => m.role === "user")?.text?.slice(0, 60) ?? null
      return { ...s, messages: next, title: nextTitle }
    }))
  }

  function createSession() {
    const s = blankSession(welcome)
    setSessions((prev: any) => [s, ...prev].slice(0, MAX_SESSIONS))
    setActiveId(s.id)
    setSessionPanel(false)
  }

  function switchSession(id: any) {
    setActiveId(id)
    setSessionPanel(false)
  }

  function deleteSession(id: any) {
    setSessions((prev: any) => {
      const next = prev.filter((s: any) => s.id !== id)
      if (next.length === 0) {
        const fresh = blankSession(welcome)
        setActiveId(fresh.id)
        return [fresh]
      }
      if (id === activeId) setActiveId(next[0].id)
      return next
    })
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storagePrefix}-sessions`, JSON.stringify(sessions))
    } catch {
      /* ignore */
    }
  }, [sessions, storagePrefix])

  useEffect(() => {
    try {
      if (activeId) window.localStorage.setItem(`${storagePrefix}-active`, activeId)
    } catch {
      /* ignore */
    }
  }, [activeId, storagePrefix])

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storagePrefix}-width`, String(width))
    } catch {
      // ignore storage errors
    }
  }, [width, storagePrefix])

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storagePrefix}-height`, String(height))
    } catch {
      /* ignore */
    }
  }, [height, storagePrefix])

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storagePrefix}-minimized`, String(minimized))
    } catch {
      /* ignore */
    }
  }, [minimized, storagePrefix])

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storagePrefix}-position`, JSON.stringify(position))
    } catch {
      /* ignore */
    }
  }, [position, storagePrefix])

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storagePrefix}-opacity`, String(opacity))
    } catch {
      /* ignore */
    }
  }, [opacity, storagePrefix])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (minimized) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" })
  }, [minimized])

  useEffect(() => {
    function handlePointerMove(e: any) {
      const resize = resizeStateRef.current
      if (resize) {
        if (resize.axis.w) {
          // Left-edge handle: grows leftward, so keep the right edge anchored by shifting x.
          const delta = resize.startX - e.clientX
          const viewportMax = Math.floor(window.innerWidth * 0.92)
          const nextWidth = Math.min(Math.min(MAX_WIDTH, viewportMax), Math.max(minWidth(), resize.startWidth + delta))
          setWidth(nextWidth)
          setPosition((p: any) => ({ ...p, x: Math.max(0, resize.startLeft + (resize.startWidth - nextWidth)) }))
        }
        if (resize.axis.h) {
          // Bottom-edge handle: grows downward, top anchored. Cap so it stays on-screen.
          const deltaY = e.clientY - resize.startY
          const viewportMax = Math.min(MAX_HEIGHT, window.innerHeight - resize.startTop - 8)
          const nextHeight = Math.min(viewportMax, Math.max(MIN_HEIGHT, resize.startHeight + deltaY))
          setHeight(nextHeight)
        }
        return
      }

      const drag = dragStateRef.current
      if (drag) {
        const w = panelRef.current?.offsetWidth ?? width
        const h = panelRef.current?.offsetHeight ?? height
        const nx = drag.startLeft + (e.clientX - drag.startX)
        const ny = drag.startTop + (e.clientY - drag.startY)
        setPosition(clampPosition(nx, ny, w, h))
      }
    }

    function stop() {
      resizeStateRef.current = null
      dragStateRef.current = null
      setDragging(false)
      setResizing(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", stop)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", stop)
    }
  }, [width, height])

  async function submitQuestion({ text, mentions, contextOverride }: any) {
    const history = messages.filter((m: any) => !m.welcome)

    const mentionEntries = (mentions || []).map((m: any) => ({ id: m.id, name: m.name, kind: m.kind }))
    const mentionContext: Record<string, any> = {}
    if (mentionEntries.length > 0) mentionContext.mentions = mentionEntries

    const finalContext = contextOverride
      ? { ...contextOverride, ...mentionContext }
      : { ...context, ...mentionContext }

    setPending(true)
    try {
      const data = await onAsk(text, finalContext, history)
      setMessages((prev: any) => [
        ...prev,
        { role: "user", text },
        { role: "assistant", text: data.answer, tools: data.tools || [], charts: data.charts || [] },
      ])
    } catch (error: any) {
      setMessages((prev: any) => [
        ...prev,
        { role: "user", text },
        { role: "assistant", text: `Sorry, I hit an error: ${error?.message ?? "unknown error"}` },
      ])
    } finally {
      setPending(false)
    }
  }

  useEffect(() => {
    if (!autoAsk) return
    setMinimized(false)
    submitQuestion({ text: autoAsk.initialMessage, mentions: [], contextOverride: autoAsk.context })
    onAutoAskConsumed?.()
  }, [autoAsk]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 1 — notification "open in chat": stash the prompt and create a blank session.
  // We can't submit here because submitQuestion still closes over the OLD session's messages.
  useEffect(() => {
    if (!pendingPrompt) return
    setMinimized(false)
    pendingNotifRef.current = pendingPrompt
    onPendingPromptConsumed?.()
    createSession()
  }, [pendingPrompt]) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase 2 — after activeId changes the component re-renders with the new (empty) session.
  // Now submitQuestion captures history = [] and we can safely auto-submit.
  useEffect(() => {
    const prompt = pendingNotifRef.current
    if (!prompt) return
    pendingNotifRef.current = null
    submitQuestion({ text: prompt, mentions: [] })
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!prefillPrompt) return
    setMinimized(false)
    setComposerPrefill(prefillPrompt)
    onPrefillPromptConsumed?.()
  }, [prefillPrompt]) // eslint-disable-line react-hooks/exhaustive-deps

  function startResizing(e: any, axis: any = { w: true, h: false }) {
    e.stopPropagation() // don't let the header drag handle also fire
    resizeStateRef.current = {
      startX: e.clientX, startY: e.clientY,
      startWidth: width, startHeight: height,
      startLeft: position.x, startTop: position.y,
      axis,
    }
    setResizing(true)
    document.body.style.cursor = axis.w && axis.h ? "nesw-resize" : axis.h ? "ns-resize" : "ew-resize"
    document.body.style.userSelect = "none"
  }

  function startDragging(e: any) {
    if (e.button != null && e.button !== 0) return // left button only
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, startLeft: position.x, startTop: position.y }
    setDragging(true)
    document.body.style.cursor = "grabbing"
    document.body.style.userSelect = "none"
  }

  // Minimized — floating chat bubble launcher.
  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        title={`Open ${title}`}
        aria-label={`Open ${title}`}
        className="ui-fa-launcher"
      >
        <svg width={20} height={20} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    )
  }

  return (
    <aside
      ref={panelRef}
      className={`ui-fa-panel ${
        dragging ? "ui-fa-panel--drag" : ""
      } ${
        dragging || resizing ? "ui-fa-panel--active" : ""
      }`}
      style={{
        ...panelGeometry({ position, width, height, available: keyboardH }),
        transformOrigin: "center",
        // Lifting the panel nudges it more opaque so it reads as "above" the page.
        backgroundColor: `color-mix(in srgb, var(--surface) ${Math.round(Math.min(1, (dragging || resizing) ? opacity + 0.05 : opacity) * 100)}%, transparent)`,
      }}
    >
      {/* Drag and resize are touch affordances too — the grips grow under a
          coarse pointer rather than disappearing. */}
      <>
        {/* Resize handle — left edge (width) */}
        <button
          type="button"
          aria-label="Resize width"
          onPointerDown={e => startResizing(e, { w: true, h: false })}
          className="ui-fa-resize-w"
        >
          <span className={`ui-fa-resize-grip ui-fa-resize-grip--v${resizing ? " ui-fa-resize-grip--active" : ""}`} />
        </button>
        {/* Resize handle — bottom edge (height). Inset on the right to clear the send button. */}
        <button
          type="button"
          aria-label="Resize height"
          onPointerDown={e => startResizing(e, { w: false, h: true })}
          className="ui-fa-resize-h"
        >
          <span className={`ui-fa-resize-grip ui-fa-resize-grip--h${resizing ? " ui-fa-resize-grip--active" : ""}`} />
        </button>
        {/* Resize handle — bottom-left corner (both) */}
        <button
          type="button"
          aria-label="Resize"
          onPointerDown={e => startResizing(e, { w: true, h: true })}
          className="ui-fa-resize-corner"
        />
      </>
      <div className="ui-fa-header">
        <div
          onPointerDown={startDragging}
          className="ui-fa-header-row ui-fa-header-row--drag"
        >
          <div className="ui-fa-title-wrap">
            <div className="ui-fa-title">
              {activeSession?.title ?? title}
            </div>
            {context?.pageType != null && (
              <div className="ui-fa-context">
                Context: {String(context.pageType)}
              </div>
            )}
          </div>
          <div className="ui-fa-header-actions">
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={() => setSessionPanel((v: boolean) => !v)}
              title="Chat history"
              className="ui-fa-hdrbtn"
            >
              History
            </button>
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={createSession}
              title="New chat"
              className="ui-fa-hdrbtn"
            >
              + New
            </button>
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={() => setMinimized(true)}
              title="Minimize"
              aria-label="Minimize assistant"
              className="ui-fa-hdrbtn"
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        <div
          onPointerDown={e => e.stopPropagation()}
          className="ui-fa-opacity-row"
          title="Panel transparency"
        >
          <svg className="ui-fa-opacity-icon" width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none" />
          </svg>
          <input
            type="range"
            min={Math.round(MIN_OPACITY * 100)}
            max={100}
            step={1}
            value={Math.round(opacity * 100)}
            onChange={e => setOpacity(Number(e.target.value) / 100)}
            aria-label="Panel transparency"
            className="ui-fa-opacity-range"
            style={{ "--op-fill": `${((opacity * 100 - MIN_OPACITY * 100) / (100 - MIN_OPACITY * 100)) * 100}%` } as any}
          />
        </div>

        {sessionPanelOpen && (
          <div className="ui-fa-sessions">
            <div className="ui-fa-session-list">
              {sessions.map((s: any) => (
                <div
                  key={s.id}
                  className={`ui-fa-session-row${s.id === activeId ? " ui-fa-session-row--active" : ""}`}
                  onClick={() => switchSession(s.id)}
                >
                  <div className="ui-fa-session-info">
                    <p className="ui-fa-session-title">{s.title ?? "New chat"}</p>
                    <p className="ui-fa-session-date">{fmtSessionDate(s.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); deleteSession(s.id) }}
                    className="ui-fa-session-del"
                    title="Delete chat"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {sessions.length > 1 && (
              <div className="ui-fa-session-footer">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete all ${sessions.length} chats?`)) {
                      const fresh = blankSession(welcome)
                      setSessions([fresh])
                      setActiveId(fresh.id)
                      setSessionPanel(false)
                    }
                  }}
                  className="ui-fa-session-delall"
                >
                  Delete all chats
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="ui-fa-messages">
        {messages.map((m: any, idx: number) => (
          <div key={idx} className={`ui-fa-msg-row ui-fa-msg-row--${m.role === "user" ? "user" : "assistant"}`}>
            {m.role === "user" ? (
              <div className="ui-fa-bubble-user">
                {renderMarkdown ? renderMarkdown(m.text) : <div className="ui-fa-plaintext">{m.text}</div>}
              </div>
            ) : (
              <AssistantMessage
                m={m}
                renderMarkdown={renderMarkdown}
                renderChart={renderChart}
                messageActions={messageActions}
                onOpenSandbox={onOpenSandbox}
              />
            )}
          </div>
        ))}
        {pending && (
          <div className="ui-fa-thinking">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <AssistantComposer
        onSubmit={submitQuestion}
        isPending={pending}
        prefill={composerPrefill}
        onPrefillConsumed={() => setComposerPrefill(null)}
        mentionSearch={mentionSearch}
        placeholder={mentionSearch ? "Ask about this page… Use @ to mention" : "Ask about this page…"}
      />
    </aside>
  )
}
