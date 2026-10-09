export interface BootGuardOptions {
    /** The app's display name: "Football couldn't start". */
    app: string;
    /** Client build id, when the HTML knows it (the same value as initReporting's build). */
    build?: string;
    /** Same-origin endpoint. Default "/internal/errors" (initReporting's default). */
    endpoint?: string;
    /** Same-origin path prefix of the app's own files. Default "/assets/". */
    assetPrefix?: string;
    /** How long the bundle has to call initReporting(). Default 12000. */
    timeoutMs?: number;
}
/** The global initReporting() sets; the guard stands down when it is assigned. */
export declare const BOOTED_FLAG = "__kitBooted";
/**
 * The guard as the text of an inline <script> (no tags): ES5, no
 * dependencies, ~2 KB. Put it in <head> before the app's module script. Vite
 * apps use the kitBootGuard() plugin from "@mukco/ui-kit/vite" instead.
 */
export declare function bootGuardScript(options: BootGuardOptions): string;
