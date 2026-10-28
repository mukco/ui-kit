import { useEffect, useState, type ReactNode } from "react"
import { SettingsGroup } from "./SettingsGroup"
import { SegmentedControl } from "./SegmentedControl"
import { IconDownload, IconMonitor } from "./Icon"
import { SKIN_THEMES, useSkinTheme, type SkinTheme } from "./skinTheme"

/**
 * Settings → Appearance: light, dark or Phosphor. No sentence under the title
 * by default: three named options say what they are. An app that has a
 * genuinely non-obvious point to make passes `description`.
 */
export function AppearanceCard({ description }: { /** @deprecated No longer shown; drop it from callers. */ appName?: string; description?: ReactNode } = {}) {
  const [theme, setTheme] = useSkinTheme()
  return (
    <SettingsGroup title="Appearance" description={description} icon={<IconMonitor size={18} />}>
      <SegmentedControl options={SKIN_THEMES} active={theme} onChange={(id) => setTheme(id as SkinTheme)} />
    </SettingsGroup>
  )
}

type InstallEvent = Event & { prompt: () => void }

/**
 * Settings → Install the app. Uses the browser's install prompt where there is
 * one; on iPhone it says how. Hidden once installed, or after "Not now". The
 * title and the Install button say what it does, so there is no description
 * unless the app passes one.
 */
export function InstallAppCard({ storageKey, description }: { /** @deprecated No longer shown; drop it from callers. */ appName?: string; storageKey: string; description?: ReactNode }) {
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
    <SettingsGroup title="Install the app" description={description} icon={<IconDownload size={18} />}>
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
