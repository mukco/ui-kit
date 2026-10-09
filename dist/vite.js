/**
 * @mukco/ui-kit/vite — build-time helpers for apps on the kit. Runs in node
 * (vite.config.ts), never in the browser; no runtime dependencies, and no
 * import of vite itself, so it works with whichever Vite an app has (5 … 8).
 */
import { bootGuardScript } from "./observability/bootGuard.js";
/**
 * Puts the boot guard (see bootGuardScript) inline at the top of <head> in
 * every HTML entry, ahead of the module script and its CSS/preloads — so a
 * page whose bundle 404s still reports, reloads once for fresh HTML, and then
 * says "<App> couldn't start" instead of a white screen.
 *
 *   import { kitBootGuard } from "@mukco/ui-kit/vite"
 *   plugins: [react(), kitBootGuard({ app: "Football", build: buildId })]
 *
 * The bundle must call initReporting() (it sets window.__kitBooted) within
 * timeoutMs, or the guard treats the boot as failed.
 */
export function kitBootGuard(options) {
    const { dev, ...guard } = options;
    const script = bootGuardScript(guard);
    return {
        name: "mukco-ui-kit-boot-guard",
        ...(dev ? {} : { apply: "build" }),
        transformIndexHtml: {
            order: "pre",
            handler: () => [{ tag: "script", children: script, injectTo: "head-prepend" }],
        },
    };
}
