import { fingerprintOf, type ReportEvent } from "./event.js"

/**
 * Same fingerprint at most `perFingerprint` times per page session, and at
 * most `total` events overall: a render loop that throws on every frame must
 * not become a request storm. Pure; the reporter owns one per page.
 */
export function createDeduper({ perFingerprint = 5, total = 100 } = {}) {
  const seen = new Map<string, number>()
  let accepted = 0
  return {
    /** True when this event should be sent. */
    accept(ev: Pick<ReportEvent, "level" | "message" | "error_class" | "stack" | "fingerprint">): boolean {
      if (accepted >= total) return false
      const key = fingerprintOf(ev)
      const n = seen.get(key) ?? 0
      if (n >= perFingerprint) return false
      seen.set(key, n + 1)
      accepted++
      return true
    },
  }
}

export interface Transport {
  /** fetch-shaped; called with keepalive so a send survives the page closing. */
  fetch?: (url: string, init: RequestInit) => Promise<unknown>
  /** navigator.sendBeacon-shaped; used when the page is going away. */
  beacon?: (url: string, body: string) => boolean
}

export interface QueueOptions {
  endpoint: string
  transport: Transport
  /** Events per request (the contract allows 10). */
  maxBatch?: number
  /** Bytes per request. keepalive bodies share a 64 KB budget per page. */
  maxBytes?: number
  /** Events held at most; the oldest go first. */
  maxQueued?: number
  /** How long to gather events before sending (ms). */
  delayMs?: number
  setTimer?: (fn: () => void, ms: number) => unknown
}

/**
 * Collects events and sends them in small batches: fetch with keepalive in the
 * normal course, sendBeacon when the page is hiding or closing. A failed send
 * is retried once on the next flush and then dropped — the server always
 * answers 202, so the only failures are the network's, and hammering a dead
 * network helps no one.
 */
export function createQueue({
  endpoint,
  transport,
  maxBatch = 10,
  maxBytes = 60_000,
  maxQueued = 50,
  delayMs = 1500,
  setTimer = (fn, ms) => setTimeout(fn, ms),
}: QueueOptions) {
  let queue: { ev: ReportEvent; tries: number }[] = []
  let timer: unknown = null

  function batches(items: typeof queue) {
    const out: (typeof queue)[] = []
    let cur: typeof queue = []
    let bytes = 16
    for (const item of items) {
      let size = 0
      try { size = JSON.stringify(item.ev).length + 1 } catch { continue }
      if (size > maxBytes) continue
      if (cur.length && (cur.length >= maxBatch || bytes + size > maxBytes)) {
        out.push(cur)
        cur = []
        bytes = 16
      }
      cur.push(item)
      bytes += size
    }
    if (cur.length) out.push(cur)
    return out
  }

  function sendWithFetch(batch: typeof queue) {
    if (!transport.fetch) return
    const body = JSON.stringify({ events: batch.map((b) => b.ev) })
    transport
      .fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "same-origin",
      })
      .catch(() => {
        // Back in line for one more try, then gone.
        const again = batch.filter((b) => b.tries < 1).map((b) => ({ ev: b.ev, tries: b.tries + 1 }))
        if (again.length) { queue = [...again, ...queue].slice(-maxQueued); schedule() }
      })
  }

  function schedule(ms = delayMs) {
    if (timer !== null) return
    timer = setTimer(() => { timer = null; flush() }, ms)
  }

  /** Send everything now. `leaving` = the page is hiding: use the beacon. */
  function flush(leaving = false) {
    if (!queue.length) return
    const items = queue
    queue = []
    for (const batch of batches(items)) {
      try {
        if (leaving && transport.beacon) {
          const ok = transport.beacon(endpoint, JSON.stringify({ events: batch.map((b) => b.ev) }))
          if (ok) continue
        }
        sendWithFetch(batch)
      } catch { /* never into the host app */ }
    }
  }

  return {
    push(ev: ReportEvent, { soon = false } = {}) {
      queue.push({ ev, tries: 0 })
      if (queue.length > maxQueued) queue = queue.slice(-maxQueued)
      schedule(soon ? Math.min(250, delayMs) : delayMs)
    },
    flush,
    size: () => queue.length,
  }
}
