import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { SettingRow, Toggle } from "./Settings";
import { SettingsGroup } from "./SettingsGroup";
import { IconBell } from "./Icon";
import { isIos, isStandalone } from "./push";
/**
 * Family Hub's notification settings: this device on or off, then one switch
 * per alert. The device switch must be tapped (iOS refuses a prompt without
 * one); on an iPhone it only works in the app added to the Home Screen.
 * Hidden when the server says push isn't set up.
 */
export function NotificationSettings({ client, prefs, onSetKind, appName, description = "Alerts on this device for your favorite team, games you follow and your fantasy players." }) {
    const status = client.usePushStatus();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(null);
    useEffect(() => { void client.refreshPushState(); }, [client]);
    if (prefs && !prefs.configured)
        return null;
    const iosBrowser = isIos() && !isStandalone();
    async function toggleDevice(on) {
        setBusy(true);
        setError(null);
        try {
            await (on ? client.enablePush() : client.disablePush());
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    async function sendTest() {
        const r = await client.notify.test();
        setSent(r.devices ? `Sent to ${r.devices} device${r.devices === 1 ? "" : "s"}` : "No device to send to");
    }
    const groups = [...new Set((prefs?.kinds ?? []).map((k) => k.group))];
    return (_jsx(SettingsGroup, { title: "Notifications", description: description, icon: _jsx(IconBell, { size: 18 }), children: _jsxs("div", { className: "ui-settings-stack", children: [iosBrowser ? (_jsxs("p", { className: "ui-settings-note", children: ["On iPhone, add ", appName, " to your Home Screen (Share \u2192 Add to Home Screen) and turn notifications on from there."] })) : (_jsx(SettingRow, { label: "Notify this device", hint: status === "denied" ? "Blocked in this browser's settings" : status === "unsupported" ? "Not supported in this browser" : undefined, children: _jsx(Toggle, { checked: status === "on", disabled: busy || status === "denied" || status === "unsupported" || status === "loading", onChange: toggleDevice, label: "Notify this device" }) })), status === "on" && (_jsx(SettingRow, { label: "Send a test", hint: sent ?? undefined, children: _jsx("button", { type: "button", className: "ui-btn ui-btn--sm", onClick: () => void sendTest(), children: "Send" }) })), error && _jsx("p", { className: "ui-settings-error", children: error }), groups.map((g) => (_jsxs("div", { className: "ui-settings-sub", children: [_jsx("div", { className: "ui-sectionlabel", children: _jsx("span", { className: "ui-sectionlabel-text", children: g }) }), prefs.kinds.filter((k) => k.group === g).map((k) => (_jsx(SettingRow, { label: k.label, children: _jsx(Toggle, { checked: k.on, onChange: (on) => onSetKind(k.kind, on), label: k.label }) }, k.kind)))] }, g)))] }) }));
}
