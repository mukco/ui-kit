import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { readyForNewBuild } from "./updateReady";
const DEFAULT_INTERVAL = 5 * 60 * 1000;
const DEFAULT_READY_TIMEOUT = 5_000;
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
export function UpdateToast({ getRemoteBuild, localBuild, appName = "the app", intervalMs = DEFAULT_INTERVAL, readyTimeoutMs = DEFAULT_READY_TIMEOUT, }) {
    const [available, setAvailable] = useState(false);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        if (!localBuild)
            return undefined;
        let cancelled = false;
        async function check() {
            try {
                const build = await getRemoteBuild();
                if (!cancelled && build && build !== localBuild)
                    setAvailable(true);
            }
            catch {
                // offline / mid-deploy — try again next tick
            }
        }
        const interval = setInterval(check, intervalMs);
        const onVisible = () => document.visibilityState === "visible" && check();
        document.addEventListener("visibilitychange", onVisible);
        check();
        return () => {
            cancelled = true;
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [getRemoteBuild, localBuild, intervalMs]);
    const refresh = useCallback(async () => {
        setBusy(true);
        try {
            await readyForNewBuild(readyTimeoutMs);
        }
        catch {
            // Whatever went wrong, reloading is still the best thing left to do.
        }
        window.location.reload();
    }, [readyTimeoutMs]);
    if (!available)
        return null;
    return (_jsx("div", { className: "ui-updatetoast", children: _jsxs("div", { className: "ui-card ui-updatetoast-card", children: [_jsx("span", { className: "ui-updatetoast-icon", "aria-hidden": "true", children: "\uD83D\uDD04" }), _jsxs("div", { className: "ui-updatetoast-text", children: [_jsx("div", { className: "ui-updatetoast-title", children: "Update available" }), _jsxs("div", { className: "ui-updatetoast-sub", children: ["A new version of ", appName, " has been deployed."] })] }), _jsx("button", { type: "button", className: "ui-updatetoast-refresh", onClick: refresh, disabled: busy, "aria-busy": busy, children: busy ? "Updating…" : "Refresh" })] }) }));
}
