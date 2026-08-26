interface Props {
    /** Return the remote build id; polled periodically and on tab focus. */
    getRemoteBuild: () => Promise<string | null | undefined>;
    localBuild: string | undefined;
    appName?: string;
    intervalMs?: number;
    /** How long to wait for a new service worker before reloading anyway. */
    readyTimeoutMs?: number;
}
/** "A new version has been deployed — Refresh?" toast.
 *
 *  The poll answers "is there a new build on the server". That is the right
 *  question for *showing* the toast and the wrong one for acting on it: a new
 *  build existing remotely says nothing about whether this device can serve it
 *  yet. Where a service worker is installed, the page keeps being served by the
 *  worker that is currently in control, and a plain reload re-renders the build
 *  it already had. The toast reappears, the second press works, and it looks
 *  like the app needs refreshing twice.
 *
 *  It did — this component asked for it. So Refresh now prepares the device
 *  before reloading: nudge the registration, let a waiting worker take over,
 *  and wait for control to actually change hands. Only then reload.
 *
 *  Family Hub never had this bug because it never asked the server. It watches
 *  the registration and only offers the button once a new worker has reached
 *  `activated`, at which point a plain reload is genuinely enough.
 */
export declare function UpdateToast({ getRemoteBuild, localBuild, appName, intervalMs, readyTimeoutMs, }: Props): import("react").JSX.Element | null;
export {};
