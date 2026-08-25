import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// The playground is the kit's dev environment: `npm run dev` here and every
// component renders with test data, no app needed.
export default defineConfig({
  root: "playground",
  plugins: [react()],
  // react-pivottable ships extensionless CJS deep imports; rolldown's dev
  // resolver needs these pre-bundle entries to resolve them.
  optimizeDeps: {
    include: [
      "react-pivottable/PivotTableUI",
      "react-pivottable/TableRenderers",
      "react-pivottable/Utilities",
    ],
  },
})
