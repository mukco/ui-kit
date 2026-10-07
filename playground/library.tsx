import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { UiDemo } from "../demo/UiDemo"
import "../src/ui.css"
import "../src/phosphor.css"
import { configureSkinTheme } from "../src"

// The skin theme, so the shared-shell section's Appearance card can switch to Phosphor.
configureSkinTheme({ storageKey: "uidemo-theme", metaColors: { light: "#ffffff", dark: "#0e1118", phosphor: "#0a0a07" } })

/* Every component with test data, offline — the full-inventory audit page.
   The playground's actual root is the Kit Builder now (index.html); this is
   the reference page it links back to. */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiDemo />
  </StrictMode>,
)
