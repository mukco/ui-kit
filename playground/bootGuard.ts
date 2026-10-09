// Plays index.html for the boot guard. In an app the kitBootGuard() Vite
// plugin inlines the script at build time; here it is injected by hand so the
// playground can show every branch without a build.
import { bootGuardScript } from "../src/observability/bootGuard"

const params = new URLSearchParams(location.search)
if (params.has("reset")) {
  // Forget the last reload, then drop ?reset so the guard's own reload keeps it.
  sessionStorage.removeItem("ui-kit-boot-reload-at:Football")
  params.delete("reset")
  history.replaceState(null, "", location.pathname + (params.size ? `?${params}` : ""))
}

const guard = document.createElement("script")
guard.textContent = bootGuardScript({ app: "Football", build: "playground", timeoutMs: 3000 })
document.head.prepend(guard)

if (params.has("booted")) {
  // What initReporting() does first thing.
  ;(window as unknown as Record<string, unknown>).__kitBooted = true
} else {
  // The deleted main bundle from 2026-10-09.
  const bundle = document.createElement("script")
  bundle.type = "module"
  bundle.src = "/assets/index-wQ90q-cT.js"
  document.head.append(bundle)
}
