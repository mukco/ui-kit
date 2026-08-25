import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const DEFAULT_INTERVAL = 5 * 60 * 1000;
/** "A new version has been deployed — Refresh?" toast. Compares a polled
    remote build id against the one this page loaded with; the button reloads.
    Pass localBuild from your build pipeline (e.g. __BUILD_ID__ define) and
    point getRemoteBuild at version.json or /api/build. */
export function UpdateToast({ getRemoteBuild, localBuild, appName = "the app", intervalMs = DEFAULT_INTERVAL }) {
    const [available, setAvailable] = useState(false);
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
    if (!available)
        return null;
    return (_jsx("div", { className: "ui-updatetoast", children: _jsxs("div", { className: "ui-card ui-updatetoast-card", children: [_jsx("span", { className: "ui-updatetoast-icon", "aria-hidden": "true", children: "\uD83D\uDD04" }), _jsxs("div", { className: "ui-updatetoast-text", children: [_jsx("div", { className: "ui-updatetoast-title", children: "Update available" }), _jsxs("div", { className: "ui-updatetoast-sub", children: ["A new version of ", appName, " has been deployed."] })] }), _jsx("button", { type: "button", className: "ui-updatetoast-refresh", onClick: () => window.location.reload(), children: "Refresh" })] }) }));
}
