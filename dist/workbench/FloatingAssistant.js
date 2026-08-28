import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
const MIN_OPACITY = 0.25;
const DEFAULT_OPACITY = 0.9;
// Used only to pick touch-friendly starting sizes. The panel is a floating,
// draggable, resizable window at every width — it is not a mode.
export const MOBILE_BREAKPOINT = 640;
export function isMobileViewport() {
    return typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}
// `available` is the visual-viewport height, passed only while the on-screen
// keyboard is up. The panel used to become a full-screen sheet on a phone, and
// that is what hid the send button: the sheet is 100dvh, dvh does not shrink
// for the keyboard, so the composer sat underneath it with nothing to scroll.
// Now the panel is clamped into whatever the keyboard leaves visible.
export function panelGeometry({ position, width, height, available }) {
    // The floor is the panel's own height, not MIN_HEIGHT: this clamp exists to
    // shrink a panel into the visible strip, and must never grow one the user
    // already made smaller.
    const floor = Math.min(MIN_HEIGHT, height);
    const h = available ? Math.max(floor, Math.min(height, available - 16)) : height;
    const top = available
        ? Math.max(8, Math.min(position.y, available - h - 8))
        : position.y;
    return {
        left: position.x,
        top,
        width,
        height: h,
        maxWidth: "calc(100vw - 16px)",
        maxHeight: "calc(100dvh - 16px)",
    };
}
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 340;
const MAX_WIDTH = 640;
const MIN_HEIGHT = 320;
const MAX_HEIGHT = 900;
const PANEL_H_EST = 560; // height estimate used for clamping before the panel measures itself
const EDGE_MARGIN = 24;
const MAX_SESSIONS = 30;
// A 340px floor is comfortable on a laptop and impossible on a 320px phone,
// where it would forbid resizing below the screen width.
function minWidth() {
    return Math.min(MIN_WIDTH, Math.max(240, window.innerWidth - 16));
}
function genId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
// `welcome` carries a marker so history sent to `onAsk` can drop it without
// relying on object identity, which does not survive a JSON round trip
// through localStorage.
function blankSession(welcome) {
    return { id: genId(), title: null, messages: [{ role: "assistant", text: welcome, welcome: true }], createdAt: Date.now() };
}
function loadSessions(prefix, welcome) {
    try {
        const raw = localStorage.getItem(`${prefix}-sessions`);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0)
                return parsed;
        }
        // Migrate an app's old single-history format, if it shipped one under this prefix.
        const oldRaw = localStorage.getItem(`${prefix}-history`);
        if (oldRaw) {
            const msgs = JSON.parse(oldRaw);
            if (Array.isArray(msgs) && msgs.length > 1) {
                const firstUser = msgs.find((m) => m.role === "user");
                return [{ id: genId(), title: firstUser?.text?.slice(0, 50) ?? null, messages: msgs, createdAt: Date.now() }];
            }
        }
    }
    catch {
        /* ignore */
    }
    return [blankSession(welcome)];
}
function loadActiveId(prefix, sessions) {
    try {
        const id = localStorage.getItem(`${prefix}-active`);
        if (id && sessions.find((s) => s.id === id))
            return id;
    }
    catch {
        /* ignore */
    }
    return sessions[0]?.id ?? null;
}
function fmtSessionDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diffDays === 0)
        return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    if (diffDays === 1)
        return "Yesterday";
    if (diffDays < 7)
        return d.toLocaleDateString(undefined, { weekday: "short" });
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function loadWidth(prefix) {
    try {
        const raw = window.localStorage.getItem(`${prefix}-width`);
        const parsed = Number(raw);
        // `raw` must be checked separately: Number(null) is 0, and 0 is finite, so
        // testing only the parsed number made this branch run with nothing stored
        // and pinned every first load to MIN_WIDTH.
        if (raw !== null && Number.isFinite(parsed) && parsed > 0) {
            const viewportCap = Math.floor(window.innerWidth * (isMobileViewport() ? 0.94 : 0.55));
            return Math.min(Math.min(MAX_WIDTH, viewportCap), Math.max(minWidth(), parsed));
        }
    }
    catch {
        // ignore
    }
    return isMobileViewport()
        ? Math.max(minWidth(), Math.floor(window.innerWidth * 0.94))
        : DEFAULT_WIDTH;
}
function loadMinimized(prefix) {
    try {
        // Default to minimized (bubble) on first ever load.
        return window.localStorage.getItem(`${prefix}-minimized`) !== "false";
    }
    catch {
        return true;
    }
}
function loadHeight(prefix) {
    const cap = Math.min(MAX_HEIGHT, Math.floor(window.innerHeight * 0.92));
    try {
        const parsed = Number(window.localStorage.getItem(`${prefix}-height`));
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.min(cap, Math.max(MIN_HEIGHT, parsed));
        }
    }
    catch {
        /* ignore */
    }
    // 0.62 on a phone rather than 0.7: the on-screen keyboard eats roughly the
    // bottom 45%, and a panel that opens already taller than that starts its life
    // needing to be dragged.
    const mobile = isMobileViewport();
    const share = mobile ? 0.62 : 0.7;
    // 560 is a comfortable desktop floor. On a phone it overrides the share
    // outright and puts the composer back under the keyboard.
    const floor = mobile ? MIN_HEIGHT : 560;
    return Math.min(cap, Math.max(MIN_HEIGHT, Math.round(window.innerHeight * share), floor));
}
function loadOpacity(prefix) {
    try {
        const raw = window.localStorage.getItem(`${prefix}-opacity`);
        // Same trap as loadWidth: Number(null) is 0 and 0 is finite, so this
        // returned Math.max(MIN_OPACITY, 0) — every first-ever open of the panel
        // came up at 25% opacity, the most transparent setting there is, and
        // DEFAULT_OPACITY was never reached.
        if (raw !== null) {
            const parsed = Number(raw);
            if (Number.isFinite(parsed) && parsed > 0)
                return Math.min(1, Math.max(MIN_OPACITY, parsed));
        }
    }
    catch {
        /* ignore */
    }
    return DEFAULT_OPACITY;
}
export function clampPosition(x, y, w, h) {
    const maxX = Math.max(0, window.innerWidth - w);
    const maxY = Math.max(0, window.innerHeight - h);
    return {
        x: Math.min(Math.max(0, x), maxX),
        y: Math.min(Math.max(0, y), maxY),
    };
}
// `height` is the height the panel will actually open at. It used to clamp
// against PANEL_H_EST regardless, and on a phone — where the opening height is
// a share of the screen rather than a constant — a 600px panel was positioned
// as though it were 560px and hung 40px off the bottom, taking the composer
// and the resize grips with it.
function loadPosition(prefix, width, height) {
    const w = width || DEFAULT_WIDTH;
    const h = height || PANEL_H_EST;
    try {
        const raw = window.localStorage.getItem(`${prefix}-position`);
        if (raw) {
            const p = JSON.parse(raw);
            if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) {
                return clampPosition(p.x, p.y, w, h);
            }
        }
    }
    catch {
        /* ignore */
    }
    // Default: bottom-center of the viewport.
    return clampPosition(Math.round((window.innerWidth - w) / 2), window.innerHeight - h - EDGE_MARGIN, w, h);
}
function AssistantComposer({ onSubmit, isPending, prefill, onPrefillConsumed, mentionSearch, placeholder }) {
    const [question, setQuestion] = useState("");
    const [mentions, setMentions] = useState([]);
    const [mentionResults, setMentionResults] = useState([]);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionIdx, setMentionIdx] = useState(-1);
    const inputRef = useRef(null);
    const searchTimeout = useRef(null);
    useEffect(() => {
        if (prefill) {
            setQuestion(prefill);
            onPrefillConsumed?.();
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps
    function detectMention(value, cursorPos) {
        const before = value.slice(0, cursorPos);
        const atIdx = before.lastIndexOf("@");
        if (atIdx === -1)
            return null;
        const after = before.slice(atIdx + 1);
        if (after.includes(" "))
            return null;
        return { start: atIdx, query: after };
    }
    function handleChange(e) {
        const raw = e.target.value;
        setQuestion(raw);
        if (!mentionSearch)
            return;
        const cursorPos = e.target.selectionStart;
        const mention = detectMention(raw, cursorPos);
        if (mention) {
            setMentionOpen(true);
            if (searchTimeout.current)
                clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(async () => {
                const q = mention.query.trim();
                if (q.length < 1) {
                    setMentionResults([]);
                    return;
                }
                try {
                    const results = await mentionSearch(q);
                    setMentionResults(results || []);
                    setMentionIdx(-1);
                }
                catch {
                    setMentionResults([]);
                }
            }, 200);
        }
        else {
            setMentionOpen(false);
            setMentionResults([]);
            setMentionIdx(-1);
        }
    }
    function selectMention(result) {
        const cursorPos = inputRef.current?.selectionStart ?? question.length;
        const before = question.slice(0, cursorPos);
        const atIdx = before.lastIndexOf("@");
        if (atIdx === -1)
            return;
        const after = question.slice(cursorPos);
        const newText = before.slice(0, atIdx) + "@" + result.name + " " + after;
        setQuestion(newText);
        setMentions((prev) => [...prev.filter((m) => m.name !== result.name), { name: result.name, kind: result.kind, id: result.id }]);
        setMentionOpen(false);
        setMentionResults([]);
        setMentionIdx(-1);
        setTimeout(() => {
            if (inputRef.current) {
                const pos = atIdx + result.name.length + 2;
                inputRef.current.focus();
                inputRef.current.setSelectionRange(pos, pos);
            }
        }, 0);
    }
    function handleKeyDown(e) {
        if (!mentionOpen || mentionResults.length === 0)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setMentionIdx((prev) => (prev + 1) % mentionResults.length);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setMentionIdx((prev) => (prev <= 0 ? mentionResults.length - 1 : prev - 1));
        }
        else if (e.key === "Enter" && mentionIdx >= 0) {
            e.preventDefault();
            selectMention(mentionResults[mentionIdx]);
        }
        else if (e.key === "Escape") {
            setMentionOpen(false);
            setMentionResults([]);
            setMentionIdx(-1);
        }
    }
    function submit(e) {
        e.preventDefault();
        const q = question.trim();
        if (!q || isPending)
            return;
        setQuestion("");
        setMentions([]);
        setMentionOpen(false);
        setMentionResults([]);
        if (inputRef.current)
            inputRef.current.style.height = "auto";
        onSubmit({ text: q, mentions: [...mentions] });
    }
    function handleTextareaChange(e) {
        handleChange(e);
        const ta = e.target;
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
    }
    function handleTextareaKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            if (mentionOpen && mentionIdx >= 0 && mentionResults.length > 0) {
                e.preventDefault();
                selectMention(mentionResults[mentionIdx]);
                return;
            }
            e.preventDefault();
            submit(e);
            return;
        }
        handleKeyDown(e);
    }
    return (_jsxs("form", { onSubmit: submit, className: "ui-fa-composer", children: [mentionOpen && mentionResults.length > 0 && (_jsx("div", { className: "ui-fa-mention-panel", children: mentionResults.map((result, idx) => (_jsxs("button", { type: "button", onMouseDown: (e) => { e.preventDefault(); selectMention(result); }, className: `ui-fa-mention-item${idx === mentionIdx ? " ui-fa-mention-item--active" : ""}`, children: [_jsx("span", { className: `ui-fa-mention-glyph ${result.kind === "player" ? "ui-fa-mention-glyph--player" : "ui-fa-mention-glyph--team"}`, children: result.kind === "player" ? "@" : "#" }), _jsx("span", { className: "ui-fa-mention-name", children: result.name }), result.kind && _jsxs("span", { className: "ui-fa-mention-meta", children: ["\u00B7 ", result.kind] })] }, `${result.kind}-${result.id}`))) })), _jsx("div", { className: "ui-fa-composer-fieldwrap", children: _jsx("textarea", { ref: inputRef, value: question, onChange: handleTextareaChange, onKeyDown: handleTextareaKeyDown, placeholder: placeholder, rows: 1, className: "ui-fa-textarea", style: { minHeight: "48px", maxHeight: "200px", overflowY: "auto" } }) }), _jsx("button", { type: "submit", disabled: isPending || !question.trim(), title: "Send", "aria-label": "Send", className: "ui-fa-send-btn", children: isPending ? (_jsx("div", { className: "ui-spinner" })) : (_jsxs("svg", { className: "ui-fa-send-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M22 2 11 13" }), _jsx("path", { d: "M22 2 15 22l-4-9-9-4 20-7Z" })] })) })] }));
}
function extractSqlFromMessage(m) {
    const match = m.text?.match(/```sql\s*([\s\S]+?)```/);
    return match ? match[1].trim() : null;
}
function AssistantMessage({ m, renderMarkdown, renderChart, messageActions, onOpenSandbox }) {
    const extractedSql = useMemo(() => extractSqlFromMessage(m), [m]);
    const hasText = (m.text ?? "").trim().length > 0;
    const hasCharts = m.charts?.length > 0;
    const hasTools = m.tools?.length > 0;
    const showActions = hasText && (Boolean(extractedSql && onOpenSandbox) || Boolean(messageActions));
    return (_jsxs(_Fragment, { children: [hasText && (_jsx("div", { className: "ui-fa-bubble-assistant", children: renderMarkdown ? renderMarkdown(m.text) : _jsx("div", { className: "ui-fa-plaintext", children: m.text }) })), !hasText && !hasCharts && hasTools && (_jsxs("div", { className: "ui-fa-bubble-tools", children: ["Used ", m.tools.length, " tool", m.tools.length !== 1 ? "s" : ""] })), showActions && (_jsxs("div", { className: "ui-fa-msg-actions", children: [extractedSql && onOpenSandbox && (_jsx("button", { type: "button", onClick: () => onOpenSandbox(extractedSql), className: "ui-fa-loadsql-btn", children: "Load in Sandbox \u2197" })), messageActions?.(m)] })), hasCharts && (_jsx("div", { className: "ui-fa-charts", children: m.charts.map((chart, i) => (_jsx("div", { className: "ui-fa-chart-card", children: renderChart ? renderChart(chart) : (chart.title ?? chart.type ?? "Chart") }, i))) })), hasTools && (_jsxs("details", { className: "ui-fa-tools", open: !hasText, children: [_jsxs("summary", { className: "ui-fa-tools-summary", children: ["Tools used (", m.tools.length, ")"] }), _jsx("div", { className: "ui-fa-tools-list", children: m.tools.map((t, i) => (_jsx("div", { className: "ui-fa-tool-row", children: t.tool }, i))) })] }))] }));
}
export function FloatingAssistant({ pathname, deriveContext, onAsk, title = "Assistant", welcome = "Ask me anything about the page you are viewing.", storagePrefix, mentionSearch, renderMarkdown, renderChart, messageActions, onOpenSandbox, open, autoAsk, onAutoAskConsumed, pendingPrompt, onPendingPromptConsumed, prefillPrompt, onPrefillPromptConsumed, }) {
    const context = useMemo(() => ({ ...deriveContext(pathname), pathname }), [pathname, deriveContext]);
    const [sessions, setSessions] = useState(() => loadSessions(storagePrefix, welcome));
    const [activeId, setActiveId] = useState(() => loadActiveId(storagePrefix, loadSessions(storagePrefix, welcome)));
    const [sessionPanelOpen, setSessionPanel] = useState(false);
    const [width, setWidth] = useState(() => loadWidth(storagePrefix));
    const [height, setHeight] = useState(() => loadHeight(storagePrefix));
    const [composerPrefill, setComposerPrefill] = useState(null);
    const [minimized, setMinimized] = useState(() => loadMinimized(storagePrefix));
    const [position, setPosition] = useState(() => loadPosition(storagePrefix, loadWidth(storagePrefix), loadHeight(storagePrefix)));
    // Non-null only while the on-screen keyboard is up, holding the height it
    // leaves visible. It is deliberately not `height`: `height` is persisted, and
    // a keyboard must not permanently shrink the panel the user sized.
    const [keyboardH, setKeyboardH] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [opacity, setOpacity] = useState(() => loadOpacity(storagePrefix));
    const [pending, setPending] = useState(false);
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);
    const panelRef = useRef(null);
    const resizeStateRef = useRef(null);
    const dragStateRef = useRef(null);
    const prevOpenRef = useRef(open);
    // Stores a notification prompt between the createSession() call and the next render
    // cycle (when activeId changes and messages reflects the blank session).
    const pendingNotifRef = useRef(null);
    // The on-screen keyboard shrinks the *visual* viewport. It does not shrink
    // 100dvh and it does not fire `resize` on window, so nothing here noticed it
    // and the composer slid underneath the keyboard the moment you tapped the
    // input. The 80px slack keeps browser-chrome collapse from reading as a
    // keyboard.
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv)
            return;
        const sync = () => setKeyboardH(vv.height < window.innerHeight - 80 ? vv.height : null);
        sync();
        vv.addEventListener("resize", sync);
        return () => vv.removeEventListener("resize", sync);
    }, []);
    // Keep the panel/bubble on-screen and the size within the viewport when it resizes.
    useEffect(() => {
        const handler = () => {
            setWidth((w) => Math.min(w, Math.floor(window.innerWidth * 0.92)));
            setHeight((h) => Math.min(h, Math.floor(window.innerHeight * 0.92)));
            setPosition((p) => clampPosition(p.x, p.y, width, panelRef.current?.offsetHeight ?? height));
        };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [width, height]);
    // When the app drives `open` true, expand the panel.
    useEffect(() => {
        if (open && !prevOpenRef.current)
            setMinimized(false);
        prevOpenRef.current = open;
    }, [open]);
    const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];
    const messages = activeSession?.messages ?? [{ role: "assistant", text: welcome, welcome: true }];
    function setMessages(updater) {
        setSessions((prev) => prev.map((s) => {
            if (s.id !== activeSession?.id)
                return s;
            const next = typeof updater === "function" ? updater(s.messages) : updater;
            // Auto-title from first user message
            const nextTitle = s.title ?? next.find((m) => m.role === "user")?.text?.slice(0, 60) ?? null;
            return { ...s, messages: next, title: nextTitle };
        }));
    }
    function createSession() {
        const s = blankSession(welcome);
        setSessions((prev) => [s, ...prev].slice(0, MAX_SESSIONS));
        setActiveId(s.id);
        setSessionPanel(false);
    }
    function switchSession(id) {
        setActiveId(id);
        setSessionPanel(false);
    }
    function deleteSession(id) {
        setSessions((prev) => {
            const next = prev.filter((s) => s.id !== id);
            if (next.length === 0) {
                const fresh = blankSession(welcome);
                setActiveId(fresh.id);
                return [fresh];
            }
            if (id === activeId)
                setActiveId(next[0].id);
            return next;
        });
    }
    useEffect(() => {
        try {
            window.localStorage.setItem(`${storagePrefix}-sessions`, JSON.stringify(sessions));
        }
        catch {
            /* ignore */
        }
    }, [sessions, storagePrefix]);
    useEffect(() => {
        try {
            if (activeId)
                window.localStorage.setItem(`${storagePrefix}-active`, activeId);
        }
        catch {
            /* ignore */
        }
    }, [activeId, storagePrefix]);
    useEffect(() => {
        try {
            window.localStorage.setItem(`${storagePrefix}-width`, String(width));
        }
        catch {
            // ignore storage errors
        }
    }, [width, storagePrefix]);
    useEffect(() => {
        try {
            window.localStorage.setItem(`${storagePrefix}-height`, String(height));
        }
        catch {
            /* ignore */
        }
    }, [height, storagePrefix]);
    useEffect(() => {
        try {
            window.localStorage.setItem(`${storagePrefix}-minimized`, String(minimized));
        }
        catch {
            /* ignore */
        }
    }, [minimized, storagePrefix]);
    useEffect(() => {
        try {
            window.localStorage.setItem(`${storagePrefix}-position`, JSON.stringify(position));
        }
        catch {
            /* ignore */
        }
    }, [position, storagePrefix]);
    useEffect(() => {
        try {
            window.localStorage.setItem(`${storagePrefix}-opacity`, String(opacity));
        }
        catch {
            /* ignore */
        }
    }, [opacity, storagePrefix]);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    useEffect(() => {
        if (minimized)
            return;
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "auto" });
    }, [minimized]);
    useEffect(() => {
        function handlePointerMove(e) {
            const resize = resizeStateRef.current;
            if (resize) {
                if (resize.axis.w) {
                    // Left-edge handle: grows leftward, so keep the right edge anchored by shifting x.
                    const delta = resize.startX - e.clientX;
                    const viewportMax = Math.floor(window.innerWidth * 0.92);
                    const nextWidth = Math.min(Math.min(MAX_WIDTH, viewportMax), Math.max(minWidth(), resize.startWidth + delta));
                    setWidth(nextWidth);
                    setPosition((p) => ({ ...p, x: Math.max(0, resize.startLeft + (resize.startWidth - nextWidth)) }));
                }
                if (resize.axis.h) {
                    // Bottom-edge handle: grows downward, top anchored. Cap so it stays on-screen.
                    const deltaY = e.clientY - resize.startY;
                    const viewportMax = Math.min(MAX_HEIGHT, window.innerHeight - resize.startTop - 8);
                    const nextHeight = Math.min(viewportMax, Math.max(MIN_HEIGHT, resize.startHeight + deltaY));
                    setHeight(nextHeight);
                }
                return;
            }
            const drag = dragStateRef.current;
            if (drag) {
                const w = panelRef.current?.offsetWidth ?? width;
                const h = panelRef.current?.offsetHeight ?? height;
                const nx = drag.startLeft + (e.clientX - drag.startX);
                const ny = drag.startTop + (e.clientY - drag.startY);
                setPosition(clampPosition(nx, ny, w, h));
            }
        }
        function stop() {
            resizeStateRef.current = null;
            dragStateRef.current = null;
            setDragging(false);
            setResizing(false);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stop);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stop);
        };
    }, [width, height]);
    async function submitQuestion({ text, mentions, contextOverride }) {
        const history = messages.filter((m) => !m.welcome);
        const mentionEntries = (mentions || []).map((m) => ({ id: m.id, name: m.name, kind: m.kind }));
        const mentionContext = {};
        if (mentionEntries.length > 0)
            mentionContext.mentions = mentionEntries;
        const finalContext = contextOverride
            ? { ...contextOverride, ...mentionContext }
            : { ...context, ...mentionContext };
        setPending(true);
        try {
            const data = await onAsk(text, finalContext, history);
            setMessages((prev) => [
                ...prev,
                { role: "user", text },
                { role: "assistant", text: data.answer, tools: data.tools || [], charts: data.charts || [] },
            ]);
        }
        catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "user", text },
                { role: "assistant", text: `Sorry, I hit an error: ${error?.message ?? "unknown error"}` },
            ]);
        }
        finally {
            setPending(false);
        }
    }
    useEffect(() => {
        if (!autoAsk)
            return;
        setMinimized(false);
        submitQuestion({ text: autoAsk.initialMessage, mentions: [], contextOverride: autoAsk.context });
        onAutoAskConsumed?.();
    }, [autoAsk]); // eslint-disable-line react-hooks/exhaustive-deps
    // Phase 1 — notification "open in chat": stash the prompt and create a blank session.
    // We can't submit here because submitQuestion still closes over the OLD session's messages.
    useEffect(() => {
        if (!pendingPrompt)
            return;
        setMinimized(false);
        pendingNotifRef.current = pendingPrompt;
        onPendingPromptConsumed?.();
        createSession();
    }, [pendingPrompt]); // eslint-disable-line react-hooks/exhaustive-deps
    // Phase 2 — after activeId changes the component re-renders with the new (empty) session.
    // Now submitQuestion captures history = [] and we can safely auto-submit.
    useEffect(() => {
        const prompt = pendingNotifRef.current;
        if (!prompt)
            return;
        pendingNotifRef.current = null;
        submitQuestion({ text: prompt, mentions: [] });
    }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!prefillPrompt)
            return;
        setMinimized(false);
        setComposerPrefill(prefillPrompt);
        onPrefillPromptConsumed?.();
    }, [prefillPrompt]); // eslint-disable-line react-hooks/exhaustive-deps
    function startResizing(e, axis = { w: true, h: false }) {
        e.stopPropagation(); // don't let the header drag handle also fire
        resizeStateRef.current = {
            startX: e.clientX, startY: e.clientY,
            startWidth: width, startHeight: height,
            startLeft: position.x, startTop: position.y,
            axis,
        };
        setResizing(true);
        document.body.style.cursor = axis.w && axis.h ? "nesw-resize" : axis.h ? "ns-resize" : "ew-resize";
        document.body.style.userSelect = "none";
    }
    function startDragging(e) {
        if (e.button != null && e.button !== 0)
            return; // left button only
        dragStateRef.current = { startX: e.clientX, startY: e.clientY, startLeft: position.x, startTop: position.y };
        setDragging(true);
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
    }
    // Minimized — floating chat bubble launcher.
    if (minimized) {
        return (_jsx("button", { type: "button", onClick: () => setMinimized(false), title: `Open ${title}`, "aria-label": `Open ${title}`, className: "ui-fa-launcher", children: _jsx("svg", { width: 20, height: 20, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.8, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }) }));
    }
    return (_jsxs("aside", { ref: panelRef, className: `ui-fa-panel ${dragging ? "ui-fa-panel--drag" : ""} ${dragging || resizing ? "ui-fa-panel--active" : ""}`, style: {
            ...panelGeometry({ position, width, height, available: keyboardH }),
            transformOrigin: "center",
            // Lifting the panel nudges it more opaque so it reads as "above" the page.
            backgroundColor: `color-mix(in srgb, var(--surface) ${Math.round(Math.min(1, (dragging || resizing) ? opacity + 0.05 : opacity) * 100)}%, transparent)`,
        }, children: [_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "aria-label": "Resize width", onPointerDown: e => startResizing(e, { w: true, h: false }), className: "ui-fa-resize-w", children: _jsx("span", { className: `ui-fa-resize-grip ui-fa-resize-grip--v${resizing ? " ui-fa-resize-grip--active" : ""}` }) }), _jsx("button", { type: "button", "aria-label": "Resize height", onPointerDown: e => startResizing(e, { w: false, h: true }), className: "ui-fa-resize-h", children: _jsx("span", { className: `ui-fa-resize-grip ui-fa-resize-grip--h${resizing ? " ui-fa-resize-grip--active" : ""}` }) }), _jsx("button", { type: "button", "aria-label": "Resize", onPointerDown: e => startResizing(e, { w: true, h: true }), className: "ui-fa-resize-corner" })] }), _jsxs("div", { className: "ui-fa-header", children: [_jsxs("div", { onPointerDown: startDragging, className: "ui-fa-header-row ui-fa-header-row--drag", children: [_jsxs("div", { className: "ui-fa-title-wrap", children: [_jsx("div", { className: "ui-fa-title", children: activeSession?.title ?? title }), context?.pageType != null && (_jsxs("div", { className: "ui-fa-context", children: ["Context: ", String(context.pageType)] }))] }), _jsxs("div", { className: "ui-fa-header-actions", children: [_jsx("button", { type: "button", onPointerDown: e => e.stopPropagation(), onClick: () => setSessionPanel((v) => !v), title: "Chat history", className: "ui-fa-hdrbtn", children: "History" }), _jsx("button", { type: "button", onPointerDown: e => e.stopPropagation(), onClick: createSession, title: "New chat", className: "ui-fa-hdrbtn", children: "+ New" }), _jsx("button", { type: "button", onPointerDown: e => e.stopPropagation(), onClick: () => setMinimized(true), title: "Minimize", "aria-label": "Minimize assistant", className: "ui-fa-hdrbtn", children: _jsx("svg", { width: 14, height: 14, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2.2, children: _jsx("path", { strokeLinecap: "round", d: "M5 12h14" }) }) })] })] }), _jsxs("div", { onPointerDown: e => e.stopPropagation(), className: "ui-fa-opacity-row", title: "Panel transparency", children: [_jsxs("svg", { className: "ui-fa-opacity-icon", width: 14, height: 14, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 1.6, "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "8.5" }), _jsx("path", { d: "M12 3.5a8.5 8.5 0 0 0 0 17z", fill: "currentColor", stroke: "none" })] }), _jsx("input", { type: "range", min: Math.round(MIN_OPACITY * 100), max: 100, step: 1, value: Math.round(opacity * 100), onChange: e => setOpacity(Number(e.target.value) / 100), "aria-label": "Panel transparency", className: "ui-fa-opacity-range", style: { "--op-fill": `${((opacity * 100 - MIN_OPACITY * 100) / (100 - MIN_OPACITY * 100)) * 100}%` } })] }), sessionPanelOpen && (_jsxs("div", { className: "ui-fa-sessions", children: [_jsx("div", { className: "ui-fa-session-list", children: sessions.map((s) => (_jsxs("div", { className: `ui-fa-session-row${s.id === activeId ? " ui-fa-session-row--active" : ""}`, onClick: () => switchSession(s.id), children: [_jsxs("div", { className: "ui-fa-session-info", children: [_jsx("p", { className: "ui-fa-session-title", children: s.title ?? "New chat" }), _jsx("p", { className: "ui-fa-session-date", children: fmtSessionDate(s.createdAt) })] }), _jsx("button", { type: "button", onClick: e => { e.stopPropagation(); deleteSession(s.id); }, className: "ui-fa-session-del", title: "Delete chat", children: "\u00D7" })] }, s.id))) }), sessions.length > 1 && (_jsx("div", { className: "ui-fa-session-footer", children: _jsx("button", { type: "button", onClick: () => {
                                        if (window.confirm(`Delete all ${sessions.length} chats?`)) {
                                            const fresh = blankSession(welcome);
                                            setSessions([fresh]);
                                            setActiveId(fresh.id);
                                            setSessionPanel(false);
                                        }
                                    }, className: "ui-fa-session-delall", children: "Delete all chats" }) }))] }))] }), _jsxs("div", { ref: scrollRef, className: "ui-fa-messages", children: [messages.map((m, idx) => (_jsx("div", { className: `ui-fa-msg-row ui-fa-msg-row--${m.role === "user" ? "user" : "assistant"}`, children: m.role === "user" ? (_jsx("div", { className: "ui-fa-bubble-user", children: renderMarkdown ? renderMarkdown(m.text) : _jsx("div", { className: "ui-fa-plaintext", children: m.text }) })) : (_jsx(AssistantMessage, { m: m, renderMarkdown: renderMarkdown, renderChart: renderChart, messageActions: messageActions, onOpenSandbox: onOpenSandbox })) }, idx))), pending && (_jsx("div", { className: "ui-fa-thinking", children: "Thinking..." })), _jsx("div", { ref: bottomRef })] }), _jsx(AssistantComposer, { onSubmit: submitQuestion, isPending: pending, prefill: composerPrefill, onPrefillConsumed: () => setComposerPrefill(null), mentionSearch: mentionSearch, placeholder: mentionSearch ? "Ask about this page… Use @ to mention" : "Ask about this page…" })] }));
}
