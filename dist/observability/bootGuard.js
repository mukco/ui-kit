/**
 * @mukco/ui-kit/observability/boot-guard — the reporter that runs with no bundle.
 *
 * On 2026-10-09 an iPhone restored an old index.html whose main bundle a later
 * deploy had deleted: /assets/index-wQ90q-cT.js 404'd, no app code ran, and the
 * kit's reporter — which lives inside that bundle — never loaded. White screen,
 * nothing reported. This guard lives in index.html itself, inline, ahead of the
 * module script, so it runs whether or not the bundle ever does.
 *
 * What it does, once per page:
 *  - In the capture phase, watches for an `error` on a <script> or a
 *    <link rel=stylesheet|modulepreload> whose URL is this origin + the asset
 *    prefix ("/assets/"). Images, media and other origins never count.
 *  - Arms a timer (12 s). initReporting() sets window.__kitBooted = true; the
 *    guard turns that assignment into "stand down" (listeners and timer gone,
 *    nothing sent). Still parsing at the deadline (slow network) → one more wait.
 *  - A failed boot sends ONE event (sendBeacon, else fetch keepalive) to the
 *    kit's endpoint, then reloads once for a fresh index.html (HTML is no-cache).
 *    Reloaded in the last 30 s already, or no sessionStorage to remember that
 *    in → a full-screen "<App> couldn't start" with a Try again button instead.
 *    No storage means no auto-reload: an unguarded reload loops forever.
 *
 * The readable source is bootGuard.es5.js (ES5: it runs on whatever browser
 * restored the page); scripts/build-boot-guard.mjs minifies it into
 * bootGuard.min.ts as a string — not a function's toString(), which a
 * consumer's bundler may rewrite. Nothing in it may throw into the page.
 * The fallback names no colour: Canvas / CanvasText under color-scheme
 * light dark follow the phone's theme with no app CSS loaded.
 */
import { RELOAD_WINDOW_MS } from "./chunk.js";
import { GUARD_PLACEHOLDER, GUARD_SOURCE } from "./bootGuard.min.js";
/** The global initReporting() sets; the guard stands down when it is assigned. */
export const BOOTED_FLAG = "__kitBooted";
/** JSON that is safe inside an inline <script>: no "</script", "<!--", or U+2028/9. */
function scriptSafeJson(value) {
    return JSON.stringify(value)
        .replace(/</g, "\\u003c")
        .replace(/[^\x00-\x7f]/g, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
/**
 * The guard as the text of an inline <script> (no tags): ES5, no
 * dependencies, ~2 KB. Put it in <head> before the app's module script. Vite
 * apps use the kitBootGuard() plugin from "@mukco/ui-kit/vite" instead.
 */
export function bootGuardScript(options) {
    const cfg = {
        a: String(options.app || "The app"),
        b: options.build ? String(options.build) : "",
        e: options.endpoint || "/internal/errors",
        p: options.assetPrefix || "/assets/",
        t: options.timeoutMs && options.timeoutMs > 0 ? Math.round(options.timeoutMs) : 12_000,
        w: RELOAD_WINDOW_MS,
    };
    return GUARD_SOURCE.replace(GUARD_PLACEHOLDER, () => scriptSafeJson(cfg));
}
