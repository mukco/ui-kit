import { useEffect, useState, type ReactNode } from "react"
import { SettingsGroup } from "./SettingsGroup"
import { SegmentedControl } from "./SegmentedControl"
import { IconDownload, IconMonitor } from "./Icon"
import { SKIN_THEMES, useSkinTheme, type SkinTheme } from "./skinTheme"

const possessive = (name: string) => (name.endsWith("s") ? `${name}'` : `${name}'s`)

/** Settings → Appearance: light, dark or Phosphor. */
export function AppearanceCard({ appName }: { appName: string }) {
  const [theme, setTheme] = useSkinTheme()
  return (
    <SettingsGroup title="Appearance" description={`Phosphor is Family Hub's amber screen, with ${possessive(appName)} photos and colour.`} icon={<IconMonitor size={18} />}>
      <SegmentedControl options={SKIN_THEMES} active={theme} onChange={(id) => setTheme(id as SkinTheme)} />
    </SettingsGroup>
  )
}

type InstallEvent = Event & { prompt: () => void }

/**
 * Settings → Install the app. Uses the browser's install prompt where there is
 * one; on iPhone it says how. Hidden once installed, or after "Not now".
 */
export function InstallAppCard({ appName, storageKey, description }: { appName: string; storageKey: string; description?: ReactNode }) {
  const standalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true)
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey) === "1" } catch { return false }
  })
  const [showIos, setShowIos] = useState(false)
  const ios = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent) }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])
  if (standalone || dismissed) return null

  return (
    <SettingsGroup title="Install the app" description={description ?? `Get ${appName} on your home screen — one tap, no app store.`} icon={<IconDownload size={18} />}>
      {showIos || (ios && !event) ? (
        <p className="ui-settings-note">In Safari: tap Share, then “Add to Home Screen”.</p>
      ) : (
        <div className="ui-settings-actions">
          <button type="button" className="ui-btn ui-btn--primary" onClick={() => (event ? event.prompt() : setShowIos(true))}>
            {event ? "Install" : "Show me how"}
          </button>
          <button type="button" className="ui-btn ui-btn--quiet" onClick={() => { try { localStorage.setItem(storageKey, "1") } catch { /* private mode */ } setDismissed(true) }}>
            Not now
          </button>
        </div>
      )}
    </SettingsGroup>
  )
}
