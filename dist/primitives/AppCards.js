import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SettingsGroup } from "./SettingsGroup";
import { SegmentedControl } from "./SegmentedControl";
import { IconDownload, IconMonitor } from "./Icon";
import { SKIN_THEMES, useSkinTheme } from "./skinTheme";
/**
 * Settings → Appearance: light, dark or Phosphor. No sentence under the title
 * by default: three named options say what they are. An app that has a
 * genuinely non-obvious point to make passes `description`.
 */
export function AppearanceCard({ description } = {}) {
    const [theme, setTheme] = useSkinTheme();
    return (_jsx(SettingsGroup, { title: "Appearance", description: description, icon: _jsx(IconMonitor, { size: 18 }), children: _jsx(SegmentedControl, { options: SKIN_THEMES, active: theme, onChange: (id) => setTheme(id) }) }));
}
/**
 * Settings → Install the app. Uses the browser's install prompt where there is
 * one; on iPhone it says how. Hidden once installed, or after "Not now". The
 * title and the Install button say what it does, so there is no description
 * unless the app passes one.
 */
export function InstallAppCard({ storageKey, description }) {
    const standalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true);
    const [event, setEvent] = useState(null);
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(storageKey) === "1";
        }
        catch {
            return false;
        }
    });
    const [showIos, setShowIos] = useState(false);
    const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
    useEffect(() => {
        const onPrompt = (e) => { e.preventDefault(); setEvent(e); };
        window.addEventListener("beforeinstallprompt", onPrompt);
        return () => window.removeEventListener("beforeinstallprompt", onPrompt);
    }, []);
    if (standalone || dismissed)
        return null;
    return (_jsx(SettingsGroup, { title: "Install the app", description: description, icon: _jsx(IconDownload, { size: 18 }), children: showIos || (ios && !event) ? (_jsx("p", { className: "ui-settings-note", children: "In Safari: tap Share, then \u201CAdd to Home Screen\u201D." })) : (_jsxs("div", { className: "ui-settings-actions", children: [_jsx("button", { type: "button", className: "ui-btn ui-btn--primary", onClick: () => (event ? event.prompt() : setShowIos(true)), children: event ? "Install" : "Show me how" }), _jsx("button", { type: "button", className: "ui-btn ui-btn--quiet", onClick: () => { try {
                        localStorage.setItem(storageKey, "1");
                    }
                    catch { /* private mode */ } setDismissed(true); }, children: "Not now" })] })) }));
}
