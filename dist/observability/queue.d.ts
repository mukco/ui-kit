import { type ReportEvent } from "./event.js";
/**
 * Same fingerprint at most `perFingerprint` times per page session, and at
 * most `total` events overall: a render loop that throws on every frame must
 * not become a request storm. Pure; the reporter owns one per page.
 */
export declare function createDeduper({ perFingerprint, total }?: {
    perFingerprint?: number | undefined;
    total?: number | undefined;
}): {
    /** True when this event should be sent. */
    accept(ev: Pick<ReportEvent, "level" | "message" | "error_class" | "stack" | "fingerprint">): boolean;
};
export interface Transport {
    /** fetch-shaped; called with keepalive so a send survives the page closing. */
    fetch?: (url: string, init: RequestInit) => Promise<unknown>;
    /** navigator.sendBeacon-shaped; used when the page is going away. */
    beacon?: (url: string, body: string) => boolean;
}
export interface QueueOptions {
    endpoint: string;
    transport: Transport;
    /** Events per request (the contract allows 10). */
    maxBatch?: number;
    /** Bytes per request. keepalive bodies share a 64 KB budget per page. */
    maxBytes?: number;
    /** Events held at most; the oldest go first. */
    maxQueued?: number;
    /** How long to gather events before sending (ms). */
    delayMs?: number;
    setTimer?: (fn: () => void, ms: number) => unknown;
}
/**
 * Collects events and sends them in small batches: fetch with keepalive in the
 * normal course, sendBeacon when the page is hiding or closing. A failed send
 * is retried once on the next flush and then dropped — the server always
 * answers 202, so the only failures are the network's, and hammering a dead
 * network helps no one.
 */
export declare function createQueue({ endpoint, transport, maxBatch, maxBytes, maxQueued, delayMs, setTimer, }: QueueOptions): {
    push(ev: ReportEvent, { soon }?: {
        soon?: boolean | undefined;
    }): void;
    flush: (leaving?: boolean) => void;
    size: () => number;
};
