import { useSyncExternalStore } from "react"

/**
 * Web Push — Family Hub's client (its web/src/lib/push.ts), shared by every
 * app that sends notifications. iOS only offers push inside the installed
 * home-screen app, so check pushSupported() first.
 *
 * Pushes stop without anyone being told when a subscription goes missing:
 * reinstalling the home-screen app (or iOS clearing an unused one), a boot
 * watchdog unregistering the service worker, or the push service dropping it.
 * So the app sends its subscription on every start and whenever it comes back
 * to the front (healPush), making a new one when it has none.
 *
 * Unlike a component, this does I/O: it is the app's push client, and the
 * endpoints are the ones every app's server already serves
 * (/api/push/key, /api/push/subscription, /api/push/test, /api/notify…).
 *
 *   export const push = createPushClient({ storagePrefix: "hoops" })
 */
export type PushStatus = "unsupported" | "denied" | "off" | "on"

export interface NotifyKind { kind: string; label: string; group: string; on: boolean }
export interface NotifyPrefs { configured: boolean; kinds: NotifyKind[]; games: string[] }

export interface PushClientOptions {
  /** Prefix for this device's remembered state in localStorage ("hoops" → "hoops-push-off"). */
  storagePrefix: string
}

export class PushApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}

async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: "include", ...init })
  if (!res.ok) throw new PushApiError(res.status, `${res.status} ${path}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

const json = (method: string, body: unknown): RequestInit => ({
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
})

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

export function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true
}

export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function readKey(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function writeKey(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch { /* storage refused: it just won't be remembered */ }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

function sameKey(subscription: PushSubscription, key: Uint8Array): boolean {
  const held = subscription.options?.applicationServerKey
  if (!held) return true // the browser won't say; assume it is ours
  const bytes = new Uint8Array(held)
  return bytes.length === key.length && bytes.every((b, i) => b === key[i])
}

const HEAL_EVERY_MS = 60 * 60 * 1000

export function createPushClient({ storagePrefix }: PushClientOptions) {
  const SUBSCRIBED_KEY = `${storagePrefix}-push-subscribed`
  const OPTED_OUT_KEY = `${storagePrefix}-push-off`

  type PushState = { permission: NotificationPermission; hasSubscription: boolean | null; optedOut: boolean }
  let state: PushState = {
    permission: typeof Notification !== "undefined" ? Notification.permission : "default",
    hasSubscription: (() => { const v = readKey(SUBSCRIBED_KEY); return v === null ? null : v === "1" })(),
    optedOut: readKey(OPTED_OUT_KEY) === "1",
  }
  const listeners = new Set<() => void>()
  let lastHeal = 0

  function update(next: Partial<PushState>) {
    state = { ...state, ...next }
    if ("hasSubscription" in next) writeKey(SUBSCRIBED_KEY, next.hasSubscription == null ? null : next.hasSubscription ? "1" : "0")
    if ("optedOut" in next) writeKey(OPTED_OUT_KEY, next.optedOut ? "1" : null)
    listeners.forEach((l) => l())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }

  /** This device's switch in Settings. "loading" until the service worker has said. */
  function usePushStatus(): PushStatus | "loading" {
    const s = useSyncExternalStore(subscribe, () => state, () => state)
    if (!pushSupported()) return "unsupported"
    if (s.permission === "denied") return "denied"
    if (s.permission !== "granted") return "off"
    if (s.hasSubscription === null) return "loading"
    return s.hasSubscription ? "on" : "off"
  }

  /** Ask the service worker what it actually holds (Settings opening). */
  async function refreshPushState(): Promise<void> {
    if (!pushSupported()) return
    update({ permission: Notification.permission })
    try {
      const registration = await navigator.serviceWorker.ready
      update({ hasSubscription: (await registration.pushManager.getSubscription()) !== null })
    } catch { /* no service worker: leave what we knew */ }
  }

  async function vapidKey(): Promise<Uint8Array<ArrayBuffer>> {
    const { public_key: key } = await api<{ public_key: string | null }>("/api/push/key")
    if (!key) throw new Error("Push isn't set up on the server")
    return urlBase64ToUint8Array(key)
  }

  const post = (subscription: PushSubscription) => api("/api/push/subscription", json("POST", subscription.toJSON()))

  /**
   * Make sure this phone has a subscription and the server has it too.
   * Assumes permission is granted. Repairs, in order: none at all
   * (reinstalled), one made with an old server key (the push service would
   * refuse every message), and one the push service has already called dead
   * (the server answers 410 — make a fresh one).
   */
  async function saveSubscription(): Promise<void> {
    const key = await vapidKey()
    const registration = await navigator.serviceWorker.ready
    const make = () => registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key })

    let subscription = await registration.pushManager.getSubscription()
    if (subscription && !sameKey(subscription, key)) {
      await subscription.unsubscribe()
      subscription = null
    }
    subscription ??= await make()
    try {
      await post(subscription)
    } catch (err) {
      if (!(err instanceof PushApiError && err.status === 410)) throw err
      await subscription.unsubscribe()
      await post(await make())
    }
    update({ hasSubscription: true })
  }

  /**
   * The quiet repair: on start, and when the app comes back to the front (at
   * most hourly), send this phone's subscription to the server — making one if
   * it has none. Only when permission is already granted and the switch is on:
   * asking needs a tap (iOS refuses a prompt without one). Says nothing.
   */
  async function healPush(): Promise<void> {
    if (!pushSupported()) return
    const permission = Notification.permission
    update({ permission })
    if (permission !== "granted" || state.optedOut) return
    if (Date.now() - lastHeal < HEAL_EVERY_MS) return
    lastHeal = Date.now()
    try {
      await saveSubscription()
    } catch {
      await refreshPushState()
    }
  }

  /** "Notify this device" on — must run from a tap. */
  async function enablePush(): Promise<PushStatus> {
    // Asked first, before anything is awaited: iOS only shows the prompt while
    // the tap that asked for it is still current.
    const permission = await Notification.requestPermission()
    update({ permission })
    if (permission !== "granted") return permission === "denied" ? "denied" : "off"
    update({ optedOut: false })
    await saveSubscription()
    return "on"
  }

  /** Off: remembered, so the repair leaves it off. */
  async function disablePush(): Promise<PushStatus> {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await api("/api/push/subscription", json("DELETE", { endpoint: subscription.endpoint }))
      await subscription.unsubscribe()
    }
    update({ hasSubscription: false, optedOut: true })
    return "off"
  }

  /** What this user wants to be told, and the games they follow. */
  const notify = {
    get: () => api<NotifyPrefs>("/api/notify"),
    set: (kinds: Record<string, boolean>) => api<NotifyPrefs>("/api/notify", json("PATCH", { kinds })),
    test: () => api<{ devices: number }>("/api/push/test", { method: "POST" }),
    follow: (gameId: string, on: boolean) => api<{ games: string[] }>(`/api/notify/games/${gameId}`, { method: on ? "POST" : "DELETE" }),
  }

  return { usePushStatus, refreshPushState, healPush, enablePush, disablePush, notify }
}

export type PushClient = ReturnType<typeof createPushClient>
