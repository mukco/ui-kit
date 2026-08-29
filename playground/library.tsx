import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { UiDemo } from "../demo/UiDemo"
import "../src/ui.css"

/* Every component with test data, offline — the full-inventory audit page.
   The playground's actual root is the Kit Builder now (index.html); this is
   the reference page it links back to. */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiDemo />
  </StrictMode>,
)
