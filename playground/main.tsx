import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Builder } from "../demo/builder/Builder"
import "../src/ui.css"

/* The playground root is the Kit Builder — drag-and-drop assembly from real
   kit components, test data, nothing else. The old full-inventory demo lives
   at /library.html now; this is the one people (and agents, via the dev
   bridge) actually build pages in. */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Builder />
  </StrictMode>,
)
