/**
 * @mukco/ui-kit/vite — build-time helpers for apps on the kit. Runs in node
 * (vite.config.ts), never in the browser; no runtime dependencies, and no
 * import of vite itself, so it works with whichever Vite an app has (5 … 8).
 */
import { type BootGuardOptions } from "./observability/bootGuard.js";
export type { BootGuardOptions } from "./observability/bootGuard.js";
export interface KitBootGuardOptions extends BootGuardOptions {
    /** Inject in `vite` dev too. Default false: dev serves /src, not /assets, and a cold start can outlast the timeout. */
    dev?: boolean;
}
/** The slice of Vite's Plugin this needs — structural, so any Vite version accepts it. */
export interface KitVitePlugin {
    name: string;
    apply?: "build" | "serve";
    transformIndexHtml: {
        order: "pre";
        handler: (html: string) => {
            tag: string;
            children: string;
            injectTo: "head-prepend";
        }[];
    };
}
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
export declare function kitBootGuard(options: KitBootGuardOptions): KitVitePlugin;
