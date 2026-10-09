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
 *
 * Family Hub (2026-10-09) passes its own request function and keeps a
 * "Not now" snooze for its Home bar:
 *
 *   createPushClient({ storagePrefix: "fh", fetcher: api, snooze: true })
 */
export type PushStatus = "unsupported" | "denied" | "off" | "on"

export interface NotifyKind { kind: string; label: string; group: string; on: boolean }
export interface NotifyPrefs { configured: boolean; kinds: NotifyKind[]; games: string[] }

/** The app's own request function: resolves to the parsed JSON body (undefined when empty), rejects with an Error whose `message` a person can read and whose `status` is the HTTP status (0 when the server could not be reached). */
export type PushFetcher = <T>(path: string, init?: RequestInit) => Promise<T>

/** Where the client's requests go. Defaults are what the template apps serve. */
export interface PushPaths {
  key: string
  subscription: string
  notify: string
  test: string
  /** The follow path for one game: called with its id. */
  follow: (gameId: string) => string
}

export interface PushClientOptions {
  /** Prefix for this device's remembered state in localStorage ("hoops" → "hoops-push-off"). */
  storagePrefix: string
  /** Send requests through the app's own fetch wrapper (its messages, its headers). Default: the kit's, below. */
  fetcher?: PushFetcher
  /** Remember "Not now" on this device (`${prefix}-push-snoozed-until`), set by `snooze(ms)` and cleared by
      `enablePush`, and expose it in `usePushState`. Off by default: nothing is read or written. */
  snooze?: boolean
  /** Override any request path (an app that serves push elsewhere, or not the notify endpoints). */
  paths?: Partial<PushPaths>
}

const DEFAULT_PATHS: PushPaths = {
  key: "/api/push/key",
  subscription: "/api/push/subscription",
  notify: "/api/notify",
  test: "/api/push/test",
  follow: (gameId) => `/api/notify/games/${gameId}`,
}

export class PushApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}

/**
 * What a failed request says when the server gave no reason of its own. These
 * used to be "500 /api/push/subscription" and the browser's "Failed to
 * fetch", shown as they were in Settings. Family Hub's words (lib/api.ts).
 */
export function pushErrorMessage(status: number): string {
  if (status === 0) return "Couldn't reach the server — check the connection."
  if (status === 401) return "You've been signed out — sign in again."
  if (status === 403) return "That isn't allowed on this account."
  if (status === 404) return "Push isn't set up on this server."
  if (status === 408 || status === 504) return "The server took too long to answer."
  if (status === 429) return "Too many tries — wait a moment."
  if (status >= 500) return "Something went wrong on the server — try again."
  return "That didn't work."
}

/** The kit's request function: the server's own words (`error` or `errors`) when it sent some, plain ones otherwise. */
export const pushFetch: PushFetcher = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response
  try {
    res = await fetch(path, { credentials: "include", ...init })
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e
    throw new PushApiError(0, pushErrorMessage(0))
  }
  const text = await res.text()
  if (!res.ok) {
    let message = pushErrorMessage(res.status)
    try {
      const body = text ? JSON.parse(text) : null
      if (body && typeof body.error === "string") message = body.error
      else if (body && Array.isArray(body.errors) && typeof body.errors[0] === "string") message = body.errors.join(" ")
    } catch { /* not JSON: the plain words stand */ }
    throw new PushApiError(res.status, message)
  }
  return (text ? JSON.parse(text) : undefined) as T
}

const statusOf = (err: unknown) => (err && typeof err === "object" && "status" in err ? (err as { status: unknown }).status : undefined)

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

/** What this device last found, for an app that decides for itself what to offer (Family Hub's Home bar). */
export interface PushState {
  permission: NotificationPermission
  /** null = not known yet (still asking the service worker). */
  hasSubscription: boolean | null
  /** Turned off on purpose on this device. */
  optedOut: boolean
  /** Epoch ms "Not now" lasts until; always null unless the client was made with `snooze: true`. */
  snoozedUntil: number | null
}

export function createPushClient({ storagePrefix, fetcher = pushFetch, snooze: snoozing = false, paths: pathOverrides }: PushClientOptions) {
  const SUBSCRIBED_KEY = `${storagePrefix}-push-subscribed`
  const OPTED_OUT_KEY = `${storagePrefix}-push-off`
  const SNOOZE_KEY = `${storagePrefix}-push-snoozed-until`
  const paths: PushPaths = { ...DEFAULT_PATHS, ...pathOverrides }
  const api = fetcher

  let state: PushState = {
    permission: typeof Notification !== "undefined" ? Notification.permission : "default",
    hasSubscription: (() => { const v = readKey(SUBSCRIBED_KEY); return v === null ? null : v === "1" })(),
    optedOut: readKey(OPTED_OUT_KEY) === "1",
    snoozedUntil: snoozing ? Number(readKey(SNOOZE_KEY)) || null : null,
  }
  const listeners = new Set<() => void>()
  let lastHeal = 0

  function update(next: Partial<PushState>) {
    state = { ...state, ...next }
    if ("hasSubscription" in next) writeKey(SUBSCRIBED_KEY, next.hasSubscription == null ? null : next.hasSubscription ? "1" : "0")
    if ("optedOut" in next) writeKey(OPTED_OUT_KEY, next.optedOut ? "1" : null)
    if (snoozing && "snoozedUntil" in next) writeKey(SNOOZE_KEY, next.snoozedUntil ? String(next.snoozedUntil) : null)
    listeners.forEach((l) => l())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }

  /** The raw state, for an app's own offer rule. */
  function usePushState(): PushState {
    return useSyncExternalStore(subscribe, () => state, () => state)
  }

  /** "Not now": the offer stays hidden on this device for `ms`. Does nothing without `snooze: true`. */
  function snooze(ms: number) {
    if (snoozing) update({ snoozedUntil: Date.now() + ms })
  }

  /** This device's switch in Settings. "loading" until the service worker has said. */
  function usePushStatus(): PushStatus | "loading" {
    const s = usePushState()
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
    const { public_key: key } = await api<{ public_key: string | null }>(paths.key)
    if (!key) throw new Error("Push isn't configured on the server")
    return urlBase64ToUint8Array(key)
  }

  const post = (subscription: PushSubscription) => api(paths.subscription, json("POST", subscription.toJSON()))

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
      if (statusOf(err) !== 410) throw err
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
    update(snoozing ? { optedOut: false, snoozedUntil: null } : { optedOut: false })
    await saveSubscription()
    return "on"
  }

  /** Off: remembered, so the repair leaves it off. */
  async function disablePush(): Promise<PushStatus> {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await api(paths.subscription, json("DELETE", { endpoint: subscription.endpoint }))
      await subscription.unsubscribe()
    }
    update({ hasSubscription: false, optedOut: true })
    return "off"
  }

  /** What this user wants to be told, and the games they follow. */
  const notify = {
    get: () => api<NotifyPrefs>(paths.notify),
    set: (kinds: Record<string, boolean>) => api<NotifyPrefs>(paths.notify, json("PATCH", { kinds })),
    test: () => api<{ devices: number }>(paths.test, { method: "POST" }),
    follow: (gameId: string, on: boolean) => api<{ games: string[] }>(paths.follow(gameId), { method: on ? "POST" : "DELETE" }),
  }

  return { usePushStatus, usePushState, snooze, refreshPushState, healPush, enablePush, disablePush, notify }
}

export type PushClient = ReturnType<typeof createPushClient>
