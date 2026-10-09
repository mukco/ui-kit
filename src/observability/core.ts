/**
 * @mukco/ui-kit/observability/core — the framework-agnostic half: no React.
 * For pages that report errors without rendering React (a kiosk script).
 */
export {
  initReporting,
  report,
  note,
  flushReports,
  reportingActive,
  installChunkReload,
  installBootWatchdog,
  reloadForNewCode,
} from "./reporting.js"
export type { ReportingOptions } from "./reporting.js"
export { isStaleChunk, claimReload, STALE_CHUNK, RELOAD_WINDOW_MS } from "./chunk.js"
export type { Level, Source, Kind, ReportContext, ReportEvent } from "./event.js"
