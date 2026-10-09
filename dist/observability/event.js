export const LIMITS = {
    message: 1000,
    errorClass: 200,
    stack: 16 * 1024,
    fingerprint: 200,
    context: 8 * 1024,
    breadcrumbs: 20,
};
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
/** What an Error, a string, or whatever was thrown says about itself. */
export function describeThrown(thrown) {
    try {
        if (thrown instanceof Error || (thrown && typeof thrown === "object" && "message" in thrown)) {
            const e = thrown;
            const message = String(e.message ?? "") || String(e.name ?? "") || "Error";
            return {
                message,
                error_class: typeof e.name === "string" && e.name ? e.name : undefined,
                stack: typeof e.stack === "string" ? e.stack : undefined,
            };
        }
        if (typeof thrown === "string")
            return { message: thrown };
        if (thrown === undefined || thrown === null)
            return { message: String(thrown) };
        let text;
        try {
            text = JSON.stringify(thrown) ?? String(thrown);
        }
        catch {
            text = String(thrown);
        }
        return { message: text, error_class: typeof thrown };
    }
    catch {
        return { message: "Unreadable error" };
    }
}
/**
 * The same text for the same bug: numbers, hex ids, UUIDs and quoted strings
 * become placeholders, so "row 41 missing" and "row 42 missing" count as one.
 * The estate normalizes again on its side; this is only for client dedupe.
 */
export function normalizeMessage(message) {
    return message
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<uuid>")
        .replace(/(["'`])(?:(?!\1).){0,200}\1/g, "<str>")
        .replace(/\b0x[0-9a-f]+\b|\b[0-9a-f]{8,}\b/gi, "<hex>")
        .replace(/\d+(\.\d+)?/g, "<n>")
        .trim();
}
/** The first frame of a stack, without the build hash or line/column. */
export function topFrame(stack) {
    if (!stack)
        return "";
    for (const raw of stack.split("\n")) {
        const line = raw.trim();
        // V8: "at fn (url:1:2)"; WebKit/Gecko: "fn@url:1:2".
        if (!(line.startsWith("at ") || line.includes("@")))
            continue;
        return line
            .replace(/^at\s+/, "")
            .replace(/:\d+(:\d+)?\)?$/, "")
            .replace(/https?:\/\/[^/\s]+/, "")
            .replace(/[-.][0-9a-zA-Z_]{8,}(\.(m?js|css))/, "$1");
    }
    return "";
}
/** Client-side grouping key: custom when given, else level + class + message + top frame. */
export function fingerprintOf(e) {
    if (e.fingerprint)
        return e.fingerprint;
    return [e.level, e.error_class ?? "", normalizeMessage(e.message), topFrame(e.stack)].join("|");
}
export function newEventId() {
    try {
        const c = globalThis.crypto;
        if (c && typeof c.randomUUID === "function")
            return c.randomUUID();
    }
    catch { /* insecure context */ }
    const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return `${hex(8)}-${hex(4)}-4${hex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${hex(3)}-${hex(12)}`;
}
/** Fit the context under the contract's 8 KB, shedding the bulkiest parts first. */
export function fitContext(ctx) {
    const size = (c) => { try {
        return JSON.stringify(c).length;
    }
    catch {
        return Infinity;
    } };
    let out = { ...ctx };
    if (Array.isArray(out.breadcrumbs) && out.breadcrumbs.length > LIMITS.breadcrumbs) {
        out.breadcrumbs = out.breadcrumbs.slice(-LIMITS.breadcrumbs);
    }
    if (size(out) <= LIMITS.context)
        return out;
    if (typeof out.component_stack === "string")
        out.component_stack = clip(out.component_stack, 2000);
    if (size(out) <= LIMITS.context)
        return out;
    if (Array.isArray(out.breadcrumbs))
        out.breadcrumbs = out.breadcrumbs.slice(-8).map((b) => clip(String(b), 120));
    if (size(out) <= LIMITS.context)
        return out;
    // Something an app added is too big. Keep the fields everyone relies on.
    const keep = ["kind", "route", "breadcrumbs", "build", "ua", "screen", "online"];
    out = Object.fromEntries(keep.filter((k) => k in out).map((k) => [k, out[k]]));
    out.context_truncated = true;
    if (size(out) <= LIMITS.context)
        return out;
    return { kind: ctx.kind, context_truncated: true };
}
/** One event, fields clipped to the contract's sizes. */
export function buildEvent({ level, source, thrown, context = {}, base = {}, now = Date.now() }) {
    const d = describeThrown(thrown);
    const { fingerprint, ...rest } = context;
    const ev = {
        event_id: newEventId(),
        level,
        source,
        message: clip(d.message || "(no message)", LIMITS.message),
        occurred_at: new Date(now).toISOString(),
        context: fitContext({ kind: "manual", ...base, ...rest }),
    };
    if (d.error_class)
        ev.error_class = clip(d.error_class, LIMITS.errorClass);
    if (d.stack)
        ev.stack = clip(d.stack, LIMITS.stack);
    if (typeof fingerprint === "string" && fingerprint)
        ev.fingerprint = clip(fingerprint, LIMITS.fingerprint);
    return ev;
}
