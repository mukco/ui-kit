/** At most this many console / network reports per page session (each). */
export const CAPTURE_CAP = 50;
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
function safeJson(v) {
    try {
        const seen = new WeakSet();
        const s = JSON.stringify(v, (_k, x) => {
            if (typeof x === "bigint")
                return `${x}n`;
            if (typeof x === "function")
                return `[fn ${x.name || "anonymous"}]`;
            if (x && typeof x === "object") {
                if (seen.has(x))
                    return "[circular]";
                seen.add(x);
            }
            return x;
        });
        return s === undefined ? String(v) : s;
    }
    catch {
        try {
            return String(v);
        }
        catch {
            return "[unprintable]";
        }
    }
}
function argText(a) {
    if (typeof a === "string")
        return a;
    if (a instanceof Error)
        return `${a.name}: ${a.message}`;
    if (a === undefined || a === null || typeof a !== "object")
        return String(a);
    return clip(safeJson(a), 300);
}
/** console's own format: "%s", "%o", "%c" … substituted the way the console would. */
export function formatConsoleArgs(args) {
    const rest = args.slice();
    let out = "";
    const first = rest[0];
    if (typeof first === "string" && /%[sdifoOc]/.test(first)) {
        rest.shift();
        out = first.replace(/%([sdifoOc%])/g, (m, f) => {
            if (f === "%")
                return "%";
            if (!rest.length)
                return m;
            const v = rest.shift();
            if (f === "c")
                return "";
            if (f === "d" || f === "i")
                return String(parseInt(String(v), 10));
            if (f === "f")
                return String(Number(v));
            return argText(v);
        });
    }
    const tail = rest.map(argText).join(" ");
    return clip([out, tail].filter(Boolean).join(" ").replace(/\s+\n/g, "\n").trim() || "(empty console.error)", 1000);
}
/** React 18 logs a second line under an error it has handed to a boundary; the Error itself is caught by alreadyReported. */
const REACT_ECHO = /^(The above error occurred in|An error occurred in the <)/;
/**
 * console.error → a warning (kind: console); console.warn → a breadcrumb.
 * The original method always runs, first. Returns an uninstall.
 */
export function captureConsole(target, hooks) {
    const origError = target.error;
    const origWarn = target.warn;
    let busy = false;
    let sent = 0;
    target.error = function patchedError(...args) {
        try {
            origError.apply(this, args);
        }
        catch { /* the console itself failed */ }
        if (busy)
            return;
        busy = true;
        try {
            const errorArg = args.find((a) => a instanceof Error);
            const message = formatConsoleArgs(args);
            hooks.defer(() => {
                try {
                    // A boundary or onerror reports the same Error a moment later or
                    // just did; React logs it too. One report, from the better source.
                    if (args.some((a) => hooks.alreadyReported(a)))
                        return;
                    if (REACT_ECHO.test(message))
                        return;
                    if (sent >= CAPTURE_CAP)
                        return;
                    sent++;
                    const thrown = errorArg ? { name: errorArg.name, message, stack: errorArg.stack } : message;
                    hooks.report("warning", thrown, { kind: "console" });
                }
                catch { /* never */ }
            });
        }
        catch { /* never */ }
        finally {
            busy = false;
        }
    };
    target.warn = function patchedWarn(...args) {
        try {
            origWarn.apply(this, args);
        }
        catch { /* the console itself failed */ }
        if (busy)
            return;
        busy = true;
        try {
            hooks.note(`console.warn: ${clip(formatConsoleArgs(args), 100)}`);
        }
        catch { /* never */ }
        finally {
            busy = false;
        }
    };
    return () => {
        target.error = origError;
        target.warn = origWarn;
    };
}
/** Path only — never the query string, which can carry keys. Other origins keep their host. */
export function requestPath(url, base) {
    try {
        const u = new URL(url, base);
        const b = new URL(base);
        return u.origin === b.origin ? u.pathname : `${u.host}${u.pathname}`;
    }
    catch {
        return clip(String(url).split(/[?#]/)[0], 200);
    }
}
function networkRecorder(hooks) {
    let sent = 0;
    return (method, url, started, status, err) => {
        try {
            const path = requestPath(url, hooks.base());
            const ms = Math.max(0, Math.round(hooks.now() - started));
            const errName = err && typeof err === "object" && "name" in err ? String(err.name) : "";
            const errText = err ? (err instanceof Error ? `${err.name}: ${err.message}` : String(err)) : "";
            hooks.note(`${method} ${path} ${status ?? (errName === "AbortError" ? "aborted" : "failed")} ${ms}ms`);
            if (errName === "AbortError")
                return;
            const failed = status === null;
            if (!failed && status < 500)
                return;
            if (failed && hooks.quiet())
                return;
            if (sent >= CAPTURE_CAP)
                return;
            sent++;
            hooks.report("warning", failed ? `${method} ${path} failed: ${errText || "network error"}` : `${method} ${path} ${status}`, {
                kind: "network",
                method,
                path,
                ...(failed ? { err: clip(errText || "network error", 200) } : { status }),
                duration_ms: ms,
            });
        }
        catch { /* never */ }
    };
}
/** A fetch that leaves a breadcrumb per request and reports 5xx and failures. Same promise back, untouched. */
export function wrapFetch(original, hooks) {
    const record = networkRecorder(hooks);
    return function wrappedFetch(input, init) {
        let method = "GET";
        let url = "";
        try {
            url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
            method = String(init?.method ?? (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase();
        }
        catch { /* unreadable input: let fetch decide */ }
        const promise = original.call(this ?? globalThis, input, init);
        try {
            if (url && !hooks.isOwn(url)) {
                const started = hooks.now();
                promise.then((res) => record(method, url, started, res.status), (err) => record(method, url, started, null, err));
            }
        }
        catch { /* never */ }
        return promise;
    };
}
/** XMLHttpRequest: the same breadcrumbs and reports, via open/send. */
export function captureXhr(Xhr, hooks) {
    const record = networkRecorder(hooks);
    const proto = Xhr.prototype;
    const origOpen = proto.open;
    const origSend = proto.send;
    proto.open = function patchedOpen(...args) {
        try {
            this.__obs = { method: String(args[0] ?? "GET").toUpperCase(), url: String(args[1] ?? "") };
        }
        catch { /* never */ }
        return origOpen.apply(this, args);
    };
    proto.send = function patchedSend(body) {
        try {
            const tag = this.__obs;
            if (tag && !hooks.isOwn(tag.url)) {
                const started = hooks.now();
                let aborted = false;
                this.addEventListener("abort", () => { aborted = true; });
                this.addEventListener("loadend", () => {
                    if (aborted)
                        record(tag.method, tag.url, started, null, { name: "AbortError" });
                    else if (this.status === 0)
                        record(tag.method, tag.url, started, null, "network error");
                    else
                        record(tag.method, tag.url, started, this.status);
                });
            }
        }
        catch { /* never */ }
        return origSend.call(this, body);
    };
    return () => {
        proto.open = origOpen;
        proto.send = origSend;
    };
}
