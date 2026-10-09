/**
 * The event the browser sends to its app's POST /internal/errors — the shape
 * in the estate observability contract, section 1. Pure: no window, no
 * storage, so the node tests can drive it directly.
 */
export type Level = "error" | "warning" | "info";
export type Source = "client" | "tv";
export type Kind = "boundary" | "onerror" | "unhandledrejection" | "watchdog" | "session_died" | "chunk" | "manual" | "log" | "console" | "network" | "boot";
/** Small key/values that travel with an event. ≤ 8 KB serialized. */
export interface ReportContext {
    kind?: Kind;
    route?: string;
    component_stack?: string;
    breadcrumbs?: string[];
    build?: string;
    ua?: string;
    screen?: string;
    online?: boolean;
    /** A custom grouping key. Lifted onto the event, not sent as context. */
    fingerprint?: string;
    [key: string]: unknown;
}
export interface ReportEvent {
    event_id: string;
    level: Level;
    source: Source;
    message: string;
    error_class?: string;
    stack?: string;
    fingerprint?: string;
    occurred_at: string;
    context: ReportContext;
}
export declare const LIMITS: {
    readonly message: 1000;
    readonly errorClass: 200;
    readonly stack: number;
    readonly fingerprint: 200;
    readonly context: number;
    readonly breadcrumbs: 20;
};
/** What an Error, a string, or whatever was thrown says about itself. */
export declare function describeThrown(thrown: unknown): {
    message: string;
    error_class?: string;
    stack?: string;
};
/**
 * The same text for the same bug: numbers, hex ids, UUIDs and quoted strings
 * become placeholders, so "row 41 missing" and "row 42 missing" count as one.
 * The estate normalizes again on its side; this is only for client dedupe.
 */
export declare function normalizeMessage(message: string): string;
/** The first frame of a stack, without the build hash or line/column. */
export declare function topFrame(stack: string | undefined): string;
/** Client-side grouping key: custom when given, else level + class + message + top frame. */
export declare function fingerprintOf(e: Pick<ReportEvent, "level" | "message" | "error_class" | "stack" | "fingerprint">): string;
export declare function newEventId(): string;
/** Fit the context under the contract's 8 KB, shedding the bulkiest parts first. */
export declare function fitContext(ctx: ReportContext): ReportContext;
export interface BuildEventInput {
    level: Level;
    source: Source;
    thrown: unknown;
    context?: ReportContext;
    base?: ReportContext;
    now?: number;
}
/** One event, fields clipped to the contract's sizes. */
export declare function buildEvent({ level, source, thrown, context, base, now }: BuildEventInput): ReportEvent;
