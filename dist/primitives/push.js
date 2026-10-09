import { useSyncExternalStore } from "react";
const DEFAULT_PATHS = {
    key: "/api/push/key",
    subscription: "/api/push/subscription",
    notify: "/api/notify",
    test: "/api/push/test",
    follow: (gameId) => `/api/notify/games/${gameId}`,
};
export class PushApiError extends Error {
    status;
    constructor(status, message) { super(message); this.status = status; }
}
/**
 * What a failed request says when the server gave no reason of its own. These
 * used to be "500 /api/push/subscription" and the browser's "Failed to
 * fetch", shown as they were in Settings. Family Hub's words (lib/api.ts).
 */
export function pushErrorMessage(status) {
    if (status === 0)
        return "Couldn't reach the server — check the connection.";
    if (status === 401)
        return "You've been signed out — sign in again.";
    if (status === 403)
        return "That isn't allowed on this account.";
    if (status === 404)
        return "Push isn't set up on this server.";
    if (status === 408 || status === 504)
        return "The server took too long to answer.";
    if (status === 429)
        return "Too many tries — wait a moment.";
    if (status >= 500)
        return "Something went wrong on the server — try again.";
    return "That didn't work.";
}
/** The kit's request function: the server's own words (`error` or `errors`) when it sent some, plain ones otherwise. */
export const pushFetch = async (path, init) => {
    let res;
    try {
        res = await fetch(path, { credentials: "include", ...init });
    }
    catch (e) {
        if (e instanceof DOMException && e.name === "AbortError")
            throw e;
        throw new PushApiError(0, pushErrorMessage(0));
    }
    const text = await res.text();
    if (!res.ok) {
        let message = pushErrorMessage(res.status);
        try {
            const body = text ? JSON.parse(text) : null;
            if (body && typeof body.error === "string")
                message = body.error;
            else if (body && Array.isArray(body.errors) && typeof body.errors[0] === "string")
                message = body.errors.join(" ");
        }
        catch { /* not JSON: the plain words stand */ }
        throw new PushApiError(res.status, message);
    }
    return (text ? JSON.parse(text) : undefined);
};
const statusOf = (err) => (err && typeof err === "object" && "status" in err ? err.status : undefined);
const json = (method, body) => ({
    method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
export function pushSupported() {
    return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}
export function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
export function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function readKey(key) {
    try {
        return localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
function writeKey(key, value) {
    try {
        if (value === null)
            localStorage.removeItem(key);
        else
            localStorage.setItem(key, value);
    }
    catch { /* storage refused: it just won't be remembered */ }
}
function urlBase64ToUint8Array(base64) {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++)
        bytes[i] = raw.charCodeAt(i);
    return bytes;
}
function sameKey(subscription, key) {
    const held = subscription.options?.applicationServerKey;
    if (!held)
        return true; // the browser won't say; assume it is ours
    const bytes = new Uint8Array(held);
    return bytes.length === key.length && bytes.every((b, i) => b === key[i]);
}
const HEAL_EVERY_MS = 60 * 60 * 1000;
export function createPushClient({ storagePrefix, fetcher = pushFetch, snooze: snoozing = false, paths: pathOverrides }) {
    const SUBSCRIBED_KEY = `${storagePrefix}-push-subscribed`;
    const OPTED_OUT_KEY = `${storagePrefix}-push-off`;
    const SNOOZE_KEY = `${storagePrefix}-push-snoozed-until`;
    const paths = { ...DEFAULT_PATHS, ...pathOverrides };
    const api = fetcher;
    let state = {
        permission: typeof Notification !== "undefined" ? Notification.permission : "default",
        hasSubscription: (() => { const v = readKey(SUBSCRIBED_KEY); return v === null ? null : v === "1"; })(),
        optedOut: readKey(OPTED_OUT_KEY) === "1",
        snoozedUntil: snoozing ? Number(readKey(SNOOZE_KEY)) || null : null,
    };
    const listeners = new Set();
    let lastHeal = 0;
    function update(next) {
        state = { ...state, ...next };
        if ("hasSubscription" in next)
            writeKey(SUBSCRIBED_KEY, next.hasSubscription == null ? null : next.hasSubscription ? "1" : "0");
        if ("optedOut" in next)
            writeKey(OPTED_OUT_KEY, next.optedOut ? "1" : null);
        if (snoozing && "snoozedUntil" in next)
            writeKey(SNOOZE_KEY, next.snoozedUntil ? String(next.snoozedUntil) : null);
        listeners.forEach((l) => l());
    }
    function subscribe(listener) {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    }
    /** The raw state, for an app's own offer rule. */
    function usePushState() {
        return useSyncExternalStore(subscribe, () => state, () => state);
    }
    /** "Not now": the offer stays hidden on this device for `ms`. Does nothing without `snooze: true`. */
    function snooze(ms) {
        if (snoozing)
            update({ snoozedUntil: Date.now() + ms });
    }
    /** This device's switch in Settings. "loading" until the service worker has said. */
    function usePushStatus() {
        const s = usePushState();
        if (!pushSupported())
            return "unsupported";
        if (s.permission === "denied")
            return "denied";
        if (s.permission !== "granted")
            return "off";
        if (s.hasSubscription === null)
            return "loading";
        return s.hasSubscription ? "on" : "off";
    }
    /** Ask the service worker what it actually holds (Settings opening). */
    async function refreshPushState() {
        if (!pushSupported())
            return;
        update({ permission: Notification.permission });
        try {
            const registration = await navigator.serviceWorker.ready;
            update({ hasSubscription: (await registration.pushManager.getSubscription()) !== null });
        }
        catch { /* no service worker: leave what we knew */ }
    }
    async function vapidKey() {
        const { public_key: key } = await api(paths.key);
        if (!key)
            throw new Error("Push isn't configured on the server");
        return urlBase64ToUint8Array(key);
    }
    const post = (subscription) => api(paths.subscription, json("POST", subscription.toJSON()));
    /**
     * Make sure this phone has a subscription and the server has it too.
     * Assumes permission is granted. Repairs, in order: none at all
     * (reinstalled), one made with an old server key (the push service would
     * refuse every message), and one the push service has already called dead
     * (the server answers 410 — make a fresh one).
     */
    async function saveSubscription() {
        const key = await vapidKey();
        const registration = await navigator.serviceWorker.ready;
        const make = () => registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        let subscription = await registration.pushManager.getSubscription();
        if (subscription && !sameKey(subscription, key)) {
            await subscription.unsubscribe();
            subscription = null;
        }
        subscription ??= await make();
        try {
            await post(subscription);
        }
        catch (err) {
            if (statusOf(err) !== 410)
                throw err;
            await subscription.unsubscribe();
            await post(await make());
        }
        update({ hasSubscription: true });
    }
    /**
     * The quiet repair: on start, and when the app comes back to the front (at
     * most hourly), send this phone's subscription to the server — making one if
     * it has none. Only when permission is already granted and the switch is on:
     * asking needs a tap (iOS refuses a prompt without one). Says nothing.
     */
    async function healPush() {
        if (!pushSupported())
            return;
        const permission = Notification.permission;
        update({ permission });
        if (permission !== "granted" || state.optedOut)
            return;
        if (Date.now() - lastHeal < HEAL_EVERY_MS)
            return;
        lastHeal = Date.now();
        try {
            await saveSubscription();
        }
        catch {
            await refreshPushState();
        }
    }
    /** "Notify this device" on — must run from a tap. */
    async function enablePush() {
        // Asked first, before anything is awaited: iOS only shows the prompt while
        // the tap that asked for it is still current.
        const permission = await Notification.requestPermission();
        update({ permission });
        if (permission !== "granted")
            return permission === "denied" ? "denied" : "off";
        update(snoozing ? { optedOut: false, snoozedUntil: null } : { optedOut: false });
        await saveSubscription();
        return "on";
    }
    /** Off: remembered, so the repair leaves it off. */
    async function disablePush() {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await api(paths.subscription, json("DELETE", { endpoint: subscription.endpoint }));
            await subscription.unsubscribe();
        }
        update({ hasSubscription: false, optedOut: true });
        return "off";
    }
    /** What this user wants to be told, and the games they follow. */
    const notify = {
        get: () => api(paths.notify),
        set: (kinds) => api(paths.notify, json("PATCH", { kinds })),
        test: () => api(paths.test, { method: "POST" }),
        follow: (gameId, on) => api(paths.follow(gameId), { method: on ? "POST" : "DELETE" }),
    };
    return { usePushStatus, usePushState, snooze, refreshPushState, healPush, enablePush, disablePush, notify };
}
