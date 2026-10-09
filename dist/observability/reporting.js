import { buildEvent } from "./event.js";
import { createDeduper, createQueue } from "./queue.js";
import { HEARTBEAT_MS, startSession } from "./session.js";
import { claimReload, isStaleChunk } from "./chunk.js";
import { captureConsole, captureXhr, wrapFetch } from "./capture.js";
/** Browser noise with no information in it. */
const NOISE = [
    /^Script error\.?$/i, // a cross-origin script, details withheld by the browser
    /ResizeObserver loop (limit exceeded|completed with undelivered notifications)/i,
];
let state = null;
let chunkKey = null;
const hasWindow = () => typeof window !== "undefined" && typeof document !== "undefined";
const safeStorage = (kind) => {
    try {
        return hasWindow() ? window[kind] : null;
    }
    catch {
        return null;
    }
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "app";
const routeNow = () => { try {
    return hasWindow() ? window.location.pathname : undefined;
}
catch {
    return undefined;
} };
function pageContext() {
    const ctx = {};
    try {
        if (state?.opts.build)
            ctx.build = state.opts.build;
        ctx.route = routeNow();
        if (state)
            ctx.breadcrumbs = state.crumbs.slice();
        if (typeof navigator !== "undefined") {
            ctx.ua = navigator.userAgent;
            ctx.online = navigator.onLine;
        }
        if (hasWindow() && window.screen)
            ctx.screen = `${window.screen.width}x${window.screen.height}`;
    }
    catch { /* partial context is fine */ }
    return ctx;
}
function send(level, thrown, context) {
    const s = state;
    if (!s || s.reporting)
        return null;
    s.reporting = true;
    try {
        const ev = buildEvent({ level, source: s.opts.source, thrown, context, base: pageContext() });
        if (s.ignore.some((re) => re.test(ev.message)))
            return null;
        if (!s.dedupe.accept(ev))
            return null;
        if (thrown && typeof thrown === "object")
            s.reported.add(thrown);
        s.queue.push(ev, { soon: level === "error" });
        return ev;
    }
    catch {
        return null;
    }
    finally {
        s.reporting = false;
    }
}
/** Report deliberately. Errors may be Error objects or messages; context is small key/values. */
export const report = {
    error: (errorOrMessage, context) => { send("error", errorOrMessage, context); },
    warning: (message, context) => { send("warning", message, context); },
    info: (message, context) => { send("info", message, context); },
};
/** A breadcrumb: what just happened, in a few words ("tap Fantasy"). Last 20 travel with each report. */
export function note(what) {
    try {
        const s = state;
        if (!s)
            return;
        const secs = Math.round((Date.now() - s.start) / 1000);
        s.crumbs.push(`${secs}s ${String(what).slice(0, 120)}`);
        if (s.crumbs.length > 20)
            s.crumbs.splice(0, s.crumbs.length - 20);
    }
    catch { /* never into the host app */ }
}
/** Send anything queued now. `leaving` uses sendBeacon. */
export function flushReports(leaving = false) {
    try {
        state?.queue.flush(leaving);
    }
    catch { /* never */ }
}
/** True once initReporting has run with enabled !== false. */
export function reportingActive() {
    return state !== null;
}
// The page's fetch before network capture wraps it: reports never record themselves.
let nativeFetch;
function defaultTransport() {
    return {
        fetch: nativeFetch ? (url, init) => nativeFetch(url, init) : undefined,
        beacon: typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function"
            ? (url, body) => navigator.sendBeacon(url, body)
            : undefined,
    };
}
/** A <script> or stylesheet of this origin that failed to load: the app's own code is missing. */
function ownCodeThatFailed(target) {
    try {
        if (typeof Element === "undefined" || !(target instanceof Element))
            return null;
        const tag = target.tagName;
        const link = tag === "LINK" && /\b(stylesheet|modulepreload|preload)\b/i.test(target.getAttribute("rel") ?? "");
        if (tag !== "SCRIPT" && !link)
            return null;
        const url = target.getAttribute(tag === "SCRIPT" ? "src" : "href");
        if (!url)
            return null;
        const u = new URL(url, window.location.href);
        return u.origin === window.location.origin ? u.pathname : null;
    }
    catch {
        return null;
    }
}
function installGlobalListeners(resources) {
    // Capture phase: resource load failures don't bubble, but they do pass
    // through window on the way down. Images, media and other origins' files
    // are not the app's bugs and are left alone.
    window.addEventListener("error", (event) => {
        try {
            if (event.target && event.target !== window) {
                if (!resources)
                    return;
                const path = ownCodeThatFailed(event.target);
                if (path)
                    send("error", `Failed to load ${path}`, { kind: "chunk", file: path, fingerprint: `resource ${path.replace(/[-.][0-9a-zA-Z_]{8,}(?=\.\w+$)/, "")}` });
                return;
            }
            if (!(event instanceof ErrorEvent))
                return;
            const thrown = event.error ?? event.message;
            // A stale chunk is handled there: reloaded, or reported as blocked.
            if (chunkKey && isStaleChunk(thrown)) {
                reloadForNewCode("onerror", thrown);
                return;
            }
            send("error", thrown, { kind: "onerror", ...(event.filename ? { file: event.filename, line: event.lineno, col: event.colno } : {}) });
        }
        catch { /* never */ }
    }, true);
    window.addEventListener("unhandledrejection", (event) => {
        try {
            const reason = event.reason;
            if (chunkKey && isStaleChunk(reason)) {
                reloadForNewCode("unhandledrejection", reason);
                return;
            }
            send("error", reason, { kind: "unhandledrejection" });
        }
        catch { /* never */ }
    });
}
function installCapture(s) {
    const hooks = {
        report: (level, thrown, context) => { send(level, thrown, context); },
        note,
        alreadyReported: (x) => !!x && typeof x === "object" && s.reported.has(x),
        isOwn: (url) => {
            try {
                return new URL(url, window.location.href).pathname === new URL(s.opts.endpoint, window.location.href).pathname;
            }
            catch {
                return false;
            }
        },
        defer: (fn) => { setTimeout(fn, 0); },
        now: () => (typeof performance !== "undefined" ? performance.now() : Date.now()),
        quiet: () => (typeof navigator !== "undefined" && navigator.onLine === false) || document.visibilityState === "hidden",
        base: () => window.location.href,
    };
    if (s.opts.console !== false && typeof console !== "undefined") {
        try {
            captureConsole(console, hooks);
        }
        catch { /* never */ }
    }
    if (s.opts.network !== false) {
        try {
            if (typeof window.fetch === "function")
                window.fetch = wrapFetch(nativeFetch ?? window.fetch, hooks);
        }
        catch { /* never */ }
        try {
            if (typeof XMLHttpRequest !== "undefined")
                captureXhr(XMLHttpRequest, hooks);
        }
        catch { /* never */ }
    }
}
function installRouteCrumbs() {
    let last = routeNow();
    const onRoute = () => {
        try {
            const now = routeNow();
            if (now === last)
                return;
            last = now;
            note(`route ${now}`);
            state?.session?.beat(now, state.crumbs);
        }
        catch { /* never */ }
    };
    for (const method of ["pushState", "replaceState"]) {
        const original = history[method];
        if (typeof original !== "function")
            continue;
        history[method] = function patched(...args) {
            const result = original.apply(this, args);
            onRoute();
            return result;
        };
    }
    window.addEventListener("popstate", onRoute);
}
function installSession(s) {
    const id = Math.random().toString(36).slice(2);
    const tracker = startSession(safeStorage("localStorage"), `${slug(s.opts.app)}-session-mark`, { id, build: s.opts.build });
    s.session = tracker;
    // Another tab of the same app, still open on screen, also leaves a live
    // mark. Ask it before calling it dead: every session answers to its id.
    let channel = null;
    try {
        if (typeof BroadcastChannel === "function") {
            channel = new BroadcastChannel(`${slug(s.opts.app)}-session`);
            channel.onmessage = (e) => {
                try {
                    if (e.data?.ask === id)
                        channel?.postMessage({ alive: id });
                }
                catch { /* never */ }
            };
        }
    }
    catch {
        channel = null;
    }
    const d = tracker.died;
    if (d) {
        const reportDied = () => send("warning", "The last session ended on screen without closing — the page was killed or crashed", {
            kind: "session_died",
            fingerprint: "session_died",
            route: d.route,
            breadcrumbs: d.breadcrumbs ?? [],
            build: d.build ?? s.opts.build,
            last_beat_at: new Date(d.beat).toISOString(),
            session_seconds: Math.round((d.beat - d.started) / 1000),
            relaunch_route: routeNow(),
        });
        if (channel && Date.now() - d.beat < HEARTBEAT_MS * 3) {
            let alive = false;
            const listen = (e) => { if (e.data?.alive === d.id)
                alive = true; };
            channel.addEventListener("message", listen);
            try {
                channel.postMessage({ ask: d.id });
            }
            catch { /* never */ }
            setTimeout(() => {
                try {
                    channel?.removeEventListener("message", listen);
                    if (!alive)
                        reportDied();
                }
                catch { /* never */ }
            }, 400);
        }
        else {
            reportDied();
        }
    }
    const visible = () => document.visibilityState !== "hidden";
    if (visible())
        tracker.beat(routeNow(), s.crumbs);
    else
        tracker.clean();
    setInterval(() => {
        try {
            if (visible())
                tracker.beat(routeNow(), s.crumbs);
        }
        catch { /* never */ }
    }, HEARTBEAT_MS);
}
function installLifecycle(s) {
    // iOS home-screen apps often never fire pagehide; hidden is the last
    // reliable moment, so flush and mark clean there too.
    document.addEventListener("visibilitychange", () => {
        try {
            if (document.visibilityState === "hidden") {
                s.session?.clean();
                s.queue.flush(true);
            }
            else {
                s.session?.live();
            }
        }
        catch { /* never */ }
    });
    window.addEventListener("pagehide", () => {
        try {
            s.session?.clean();
            s.queue.flush(true);
        }
        catch { /* never */ }
    });
}
/**
 * Start reporting. Call once, first thing in main.tsx. Idempotent: a second
 * call (HMR) is ignored.
 */
export function initReporting(options) {
    try {
        // The bundle is running: the index.html boot guard (bootGuard.ts) stands
        // down on this assignment. First, and even with reporting disabled — a
        // guard that never hears it would reload a healthy app.
        if (hasWindow())
            window.__kitBooted = true;
        if (state || !hasWindow() || options.enabled === false)
            return;
        const opts = { endpoint: "/internal/errors", source: "client", ...options };
        if (typeof window.fetch === "function")
            nativeFetch = window.fetch.bind(window);
        const s = {
            opts,
            queue: createQueue({ endpoint: opts.endpoint, transport: opts.transport ?? defaultTransport() }),
            dedupe: createDeduper(),
            crumbs: [],
            start: Date.now(),
            session: null,
            ignore: [...NOISE, ...(opts.ignore ?? [])],
            reporting: false,
            reported: new WeakSet(),
        };
        state = s;
        installGlobalListeners(opts.resources !== false);
        installCapture(s);
        installRouteCrumbs();
        note(`route ${routeNow()}`);
        installLifecycle(s);
        if (opts.sessionDied !== false)
            installSession(s);
    }
    catch { /* never into the host app */ }
}
/**
 * Reload once for new code; report it. False when the guard says a reload
 * already happened in the last 30s — then the error is real and the caller
 * shows / reports it.
 */
export function reloadForNewCode(kind, thrown) {
    try {
        if (!hasWindow())
            return false;
        const key = chunkKey ?? "ui-kit-chunk-reload-at";
        if (!claimReload(safeStorage("sessionStorage"), key)) {
            send("error", thrown ?? "Stale chunk persisted after a reload", { kind: "chunk", via: kind, reload: "blocked" });
            return false;
        }
        send("info", thrown ?? "Stale chunk", { kind: "chunk", via: kind, reload: "once", fingerprint: "chunk-reload" });
        flushReports(true);
        window.location.reload();
        return true;
    }
    catch {
        return false;
    }
}
/** True when installChunkReload() has run on this page. */
export function chunkReloadInstalled() {
    return chunkKey !== null;
}
/**
 * Stale-chunk recovery: reload once (per 30 s) when a lazy route's chunk is
 * gone after a deploy. Listens for Vite's vite:preloadError; ErrorBoundary and
 * the global listeners also route stale-chunk errors here once installed.
 */
export function installChunkReload({ storageKey } = {}) {
    try {
        if (!hasWindow() || chunkKey !== null)
            return;
        chunkKey = storageKey ?? `${slug(state?.opts.app ?? "ui-kit")}-chunk-reload-at`;
        window.addEventListener("vite:preloadError", (event) => {
            try {
                const payload = event.payload;
                if (reloadForNewCode("vite:preloadError", payload))
                    event.preventDefault();
            }
            catch { /* never */ }
        });
    }
    catch { /* never */ }
}
/**
 * Report a boot that never showed real UI: after `ms`, if ready() is still
 * false, report kind watchdog and call onStall. Waits for the page to be
 * visible first — a phone locked mid-boot is not a stall. Returns a cancel.
 */
export function installBootWatchdog({ ms = 8000, ready, onStall }) {
    let cancelled = false;
    let timer = null;
    try {
        if (!hasWindow())
            return () => { };
        const started = Date.now();
        const check = () => {
            if (cancelled)
                return;
            try {
                if (ready())
                    return;
                if (document.visibilityState === "hidden") {
                    const again = () => {
                        if (document.visibilityState === "hidden")
                            return;
                        document.removeEventListener("visibilitychange", again);
                        timer = setTimeout(check, Math.min(ms, 3000));
                    };
                    document.addEventListener("visibilitychange", again);
                    return;
                }
                send("error", `The app did not show its UI within ${Math.round(ms / 1000)}s of starting`, {
                    kind: "watchdog",
                    fingerprint: "watchdog",
                    waited_ms: Date.now() - started,
                    ready_state: document.readyState,
                });
                flushReports();
                onStall?.();
            }
            catch { /* never */ }
        };
        timer = setTimeout(check, ms);
    }
    catch { /* never */ }
    return () => {
        cancelled = true;
        if (timer)
            clearTimeout(timer);
    };
}
/** For ErrorBoundary: report a caught render error, or reload when it is a stale chunk. */
export function reportBoundaryError(name, error, componentStack) {
    try {
        if (chunkKey && isStaleChunk(error))
            return reloadForNewCode("boundary", error) ? "reloading" : "reported";
        send("error", error, { kind: "boundary", boundary: name, ...(componentStack ? { component_stack: componentStack } : {}) });
    }
    catch { /* never */ }
    return "reported";
}
/** Test hook: forget everything (listeners stay; tests run in node without a window). */
export function __resetForTests() {
    state = null;
    chunkKey = null;
}
