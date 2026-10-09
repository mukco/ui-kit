/**
 * @mukco/ui-kit/observability — browser error and log reporting for the
 * estate (contract: estate observability §8). A subpath on purpose, never
 * the barrel: it does I/O, and Family Hub and NoFuss — which do not use the
 * rest of the kit — import it.
 *
 *   initReporting({ app: "Football", build: __BUILD_ID__, enabled: import.meta.env.PROD })
 *   <ErrorBoundary name="routes">…</ErrorBoundary>
 */
export * from "./core.js";
export { ErrorBoundary, CrashFallback } from "./ErrorBoundary.js";
export type { ErrorBoundaryProps, ErrorBoundaryFallbackProps } from "./ErrorBoundary.js";
