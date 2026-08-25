import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { UiDemo } from "../demo/UiDemo"
import "../src/ui.css"

/* The playground entry: kit components + test data, nothing else.
   No auth, no router, no API — it must always render offline. */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiDemo />
  </StrictMode>,
)

