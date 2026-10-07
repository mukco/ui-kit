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
export interface PushClientOptions {
    /** Prefix for this device's remembered state in localStorage ("hoops" → "hoops-push-off"). */
    storagePrefix: string;
}
export declare class PushApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function pushSupported(): boolean;
export declare function isStandalone(): boolean;
export declare function isIos(): boolean;
export declare function createPushClient({ storagePrefix }: PushClientOptions): {
    usePushStatus: () => PushStatus | "loading";
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
