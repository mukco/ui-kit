import { useEffect, useState, type ReactNode } from "react"
import { SettingRow, Toggle } from "./Settings"
import { SettingsGroup } from "./SettingsGroup"
import { IconBell } from "./Icon"
import { isIos, isStandalone, type NotifyPrefs, type PushClient } from "./push"

interface Props {
  client: PushClient
  /** The user's alert switches (client.notify.get), loaded by the app. */
  prefs: NotifyPrefs | undefined
  /** Save one switch; the app writes the answer back to its cache. */
  onSetKind: (kind: string, on: boolean) => void
  /** Named in the iPhone hint ("add Hoops to your Home Screen"). */
  appName: string
  description?: ReactNode
}

/**
 * Family Hub's notification settings: this device on or off, then one switch
 * per alert. The device switch must be tapped (iOS refuses a prompt without
 * one); on an iPhone it only works in the app added to the Home Screen.
 * Hidden when the server says push isn't set up.
 */
export function NotificationSettings({ client, prefs, onSetKind, appName, description = "Alerts on this device for your favorite team, games you follow and your fantasy players." }: Props) {
  const status = client.usePushStatus()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  useEffect(() => { void client.refreshPushState() }, [client])

  if (prefs && !prefs.configured) return null
  const iosBrowser = isIos() && !isStandalone()

  async function toggleDevice(on: boolean) {
    setBusy(true)
    setError(null)
    try {
      await (on ? client.enablePush() : client.disablePush())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    const r = await client.notify.test()
    setSent(r.devices ? `Sent to ${r.devices} device${r.devices === 1 ? "" : "s"}` : "No device to send to")
  }

  const groups = [...new Set((prefs?.kinds ?? []).map((k) => k.group))]
  return (
    <SettingsGroup title="Notifications" description={description} icon={<IconBell size={18} />}>
      <div className="ui-settings-stack">
        {iosBrowser ? (
          <p className="ui-settings-note">On iPhone, add {appName} to your Home Screen (Share → Add to Home Screen) and turn notifications on from there.</p>
        ) : (
          <SettingRow label="Notify this device" hint={status === "denied" ? "Blocked in this browser's settings" : status === "unsupported" ? "Not supported in this browser" : undefined}>
            <Toggle checked={status === "on"} disabled={busy || status === "denied" || status === "unsupported" || status === "loading"} onChange={toggleDevice} label="Notify this device" />
          </SettingRow>
        )}
        {status === "on" && (
          <SettingRow label="Send a test" hint={sent ?? undefined}>
            <button type="button" className="ui-btn ui-btn--sm" onClick={() => void sendTest()}>Send</button>
          </SettingRow>
        )}
        {error && <p className="ui-settings-error">{error}</p>}
        {groups.map((g) => (
          <div key={g} className="ui-settings-sub">
            <div className="ui-sectionlabel"><span className="ui-sectionlabel-text">{g}</span></div>
            {prefs!.kinds.filter((k) => k.group === g).map((k) => (
              <SettingRow key={k.kind} label={k.label}>
                <Toggle checked={k.on} onChange={(on) => onSetKind(k.kind, on)} label={k.label} />
              </SettingRow>
            ))}
          </div>
        ))}
      </div>
    </SettingsGroup>
  )
}
