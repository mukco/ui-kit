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
export type PushStatus = "unsupported" | "denied" | "off" | "on";
export interface NotifyKind {
    kind: string;
    label: string;
    group: string;
    on: boolean;
}
export interface NotifyPrefs {
    configured: boolean;
    kinds: NotifyKind[];
    games: string[];
}
/** The app's own request function: resolves to the parsed JSON body (undefined when empty), rejects with an Error whose `message` a person can read and whose `status` is the HTTP status (0 when the server could not be reached). */
export type PushFetcher = <T>(path: string, init?: RequestInit) => Promise<T>;
/** Where the client's requests go. Defaults are what the template apps serve. */
export interface PushPaths {
    key: string;
    subscription: string;
    notify: string;
    test: string;
    /** The follow path for one game: called with its id. */
    follow: (gameId: string) => string;
}
export interface PushClientOptions {
    /** Prefix for this device's remembered state in localStorage ("hoops" → "hoops-push-off"). */
    storagePrefix: string;
    /** Send requests through the app's own fetch wrapper (its messages, its headers). Default: the kit's, below. */
    fetcher?: PushFetcher;
    /** Remember "Not now" on this device (`${prefix}-push-snoozed-until`), set by `snooze(ms)` and cleared by
        `enablePush`, and expose it in `usePushState`. Off by default: nothing is read or written. */
    snooze?: boolean;
    /** Override any request path (an app that serves push elsewhere, or not the notify endpoints). */
    paths?: Partial<PushPaths>;
}
export declare class PushApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
/**
 * What a failed request says when the server gave no reason of its own. These
 * used to be "500 /api/push/subscription" and the browser's "Failed to
 * fetch", shown as they were in Settings. Family Hub's words (lib/api.ts).
 */
export declare function pushErrorMessage(status: number): string;
/** The kit's request function: the server's own words (`error` or `errors`) when it sent some, plain ones otherwise. */
export declare const pushFetch: PushFetcher;
export declare function pushSupported(): boolean;
export declare function isStandalone(): boolean;
export declare function isIos(): boolean;
/** What this device last found, for an app that decides for itself what to offer (Family Hub's Home bar). */
export interface PushState {
    permission: NotificationPermission;
    /** null = not known yet (still asking the service worker). */
    hasSubscription: boolean | null;
    /** Turned off on purpose on this device. */
    optedOut: boolean;
    /** Epoch ms "Not now" lasts until; always null unless the client was made with `snooze: true`. */
    snoozedUntil: number | null;
}
export declare function createPushClient({ storagePrefix, fetcher, snooze: snoozing, paths: pathOverrides }: PushClientOptions): {
    usePushStatus: () => PushStatus | "loading";
    usePushState: () => PushState;
    snooze: (ms: number) => void;
    refreshPushState: () => Promise<void>;
    healPush: () => Promise<void>;
    enablePush: () => Promise<PushStatus>;
    disablePush: () => Promise<PushStatus>;
    notify: {
        get: () => Promise<NotifyPrefs>;
        set: (kinds: Record<string, boolean>) => Promise<NotifyPrefs>;
        test: () => Promise<{
            devices: number;
        }>;
        follow: (gameId: string, on: boolean) => Promise<{
            games: string[];
        }>;
    };
};
export type PushClient = ReturnType<typeof createPushClient>;
