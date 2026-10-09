import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { isStaleChunk } from "./chunk.js";
import { reportBoundaryError } from "./reporting.js";
/**
 * Catches a render error below it, reports it (kind: boundary, with the
 * component stack) and shows a way out instead of a blank page. A stale
 * chunk after a deploy reloads once instead, when installChunkReload() is on.
 *
 * Reporting is a no-op until initReporting() runs, so the boundary is safe to
 * use anywhere — the playground, tests, an app that has not wired reporting.
 */
export class ErrorBoundary extends Component {
    state = { error: null, failed: false };
    static getDerivedStateFromError(error) {
        return { error, failed: true };
    }
    componentDidCatch(error, info) {
        try {
            reportBoundaryError(this.props.name, error, info?.componentStack);
        }
        catch { /* never into the host app */ }
    }
    reset = () => {
        this.setState({ error: null, failed: false });
        try {
            this.props.onReset?.();
        }
        catch { /* the app's own reset failed; the boundary will catch what follows */ }
    };
    // Declared, not inferred (2026-10-09): inferred from React 19's types the
    // emitted .d.ts named Promise and bigint, and an app on @types/react 18
    // (football) could not use the boundary as a JSX element (TS2786).
    render() {
        if (!this.state.failed)
            return this.props.children;
        const { fallback, name } = this.props;
        const { error } = this.state;
        try {
            if (typeof fallback === "function")
                return fallback({ error, reset: this.reset, name });
            if (fallback !== undefined)
                return fallback;
        }
        catch { /* a broken custom fallback falls back to ours */ }
        return _jsx(CrashFallback, { error: error, onReset: this.reset });
    }
}
const reload = () => {
    try {
        window.location.reload();
    }
    catch { /* nothing left to try */ }
};
/**
 * The default fallback. Works without ui.css: its own rules ride along in a
 * <style> tag under :where(), so they carry zero specificity — with the kit's
 * stylesheet loaded, ui.css and phosphor.css (the .ui-btn frame, the chrome
 * face) win; without it (Family Hub, NoFuss) these defaults stand, reading the
 * host's --text / --surface / --border when it has them and currentColor when
 * it does not.
 */
export function CrashFallback({ error, onReset }) {
    const stale = isStaleChunk(error);
    const detail = describe(error);
    return (_jsxs("div", { className: "ui-crash", role: "alert", children: [_jsx("style", { children: CRASH_CSS }), _jsxs("div", { className: "ui-crash-card", children: [_jsxs("span", { className: "ui-crash-icon", "aria-hidden": "true", children: [_jsxs("svg", { className: "ui-crash-icon-line", viewBox: "0 0 24 24", width: "28", height: "28", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" }), _jsx("path", { d: "M12 9v4M12 17h.01" })] }), _jsx("svg", { className: "ui-crash-icon-pixel", viewBox: "0 0 24 24", width: "28", height: "28", fill: "currentColor", children: _jsx("path", { d: PIXEL_WARNING }) })] }), _jsx("div", { className: "ui-crash-title", role: "heading", "aria-level": 2, children: stale ? "A new version is ready" : "Something went wrong" }), _jsx("p", { className: "ui-crash-msg", children: stale
                            ? "The app was updated while this page was open. Reload to pick up the new one."
                            : "This part of the app hit a problem and stopped. Reloading usually fixes it." }), _jsxs("div", { className: "ui-crash-actions", children: [_jsx("button", { type: "button", className: "ui-btn ui-btn--primary ui-crash-btn ui-crash-btn--primary", onClick: reload, children: "Reload" }), !stale && onReset && (_jsx("button", { type: "button", className: "ui-btn ui-crash-btn ui-crash-btn--quiet", onClick: onReset, children: "Try again" }))] }), !stale && detail && (_jsxs("details", { className: "ui-crash-details", children: [_jsx("summary", { children: "Details" }), _jsx("code", { children: detail })] }))] })] }));
}
function describe(error) {
    try {
        if (error instanceof Error)
            return `${error.name}: ${error.message}`.slice(0, 400);
        if (typeof error === "string")
            return error.slice(0, 400);
        return "";
    }
    catch {
        return "";
    }
}
// Pixelarticons' warning-diamond, the icon Phosphor draws everywhere else.
const PIXEL_WARNING = "M2 10h2v2H2zm0 4h2v-2H2zm20-4h-2v2h2zm0 4h-2v-2h2zM4 8h2v2H4zm0 8h2v-2H4zm16-8h-2v2h2zm0 8h-2v-2h2zM6 6h2v2H6zm0 12h2v-2H6zM18 6h-2v2h2zm0 12h-2v-2h2zM8 4h2v2H8zm0 16h2v-2H8zm8-16h-2v2h2zm0 16h-2v-2h2zM10 2h2v2h-2zm0 20h2v-2h-2zm4-20h-2v2h2zm0 20h-2v-2h2zm-3-5h2v-2h-2zm0-4h2V7h-2z";
/* Tokens with fallbacks for a page that has none. color-mix over currentColor
   stands in for --border / --muted, so nothing here names a colour. */
const CRASH_CSS = `
:where(.ui-crash) {
  display: flex; justify-content: center;
  padding: var(--space-6, 2rem) var(--space-4, 1rem);
  color: var(--text, inherit);
}
:where(.ui-crash-card) {
  box-sizing: border-box; width: 100%; max-width: 26rem;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3, 0.75rem);
  padding: var(--space-6, 2rem) var(--space-5, 1.5rem) var(--space-5, 1.5rem);
  text-align: center;
  background: var(--surface, transparent);
  border: 1px solid var(--border, color-mix(in srgb, currentColor 18%, transparent));
  border-radius: var(--radius-lg, 14px);
  box-shadow: var(--shadow-md, none);
}
:where(.ui-crash-icon) {
  display: inline-flex; align-items: center; justify-content: center;
  width: 3rem; height: 3rem; border-radius: 999px;
  color: var(--sev-error, var(--danger, currentColor));
  background: color-mix(in srgb, currentColor 12%, transparent);
}
:where(.ui-crash-icon-pixel) { display: none; }
:where([data-skin="phosphor"]) :where(.ui-crash-icon-pixel) { display: block; }
:where([data-skin="phosphor"]) :where(.ui-crash-icon-line) { display: none; }
:where(.ui-crash-title) {
  margin: 0; font-family: var(--px-chrome, inherit);
  font-size: calc(1.125rem + var(--fs-bump, 0px)); font-weight: 650; line-height: 1.3;
  color: var(--text, inherit);
}
:where(.ui-crash-msg) {
  margin: 0; max-width: 22rem;
  font-size: calc(0.9375rem + var(--fs-bump, 0px)); line-height: 1.5;
  color: var(--text-2, var(--muted, inherit));
}
:where(.ui-crash-actions) {
  display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-2, 0.5rem);
  margin-top: var(--space-2, 0.5rem);
}
:where(.ui-crash-btn) {
  box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; min-width: 7.5rem; padding: 0 var(--space-5, 1.5rem);
  border-radius: var(--radius-md, 10px);
  font: inherit; font-weight: 600; cursor: pointer;
  border: 1px solid var(--border-strong, color-mix(in srgb, currentColor 30%, transparent));
  background: transparent; color: var(--text, inherit);
}
/* With the kit's tokens: a filled brand button. Without them: a heavier
   outline in the text colour — currentColor can't fill a button whose own
   colour is the label, so the hierarchy comes from the frame instead. */
:where(.ui-crash-btn--primary) {
  border: 2px solid var(--brand, currentColor);
  background: var(--brand, transparent);
  color: var(--on-brand, inherit);
}
:where(.ui-crash-details) {
  width: 100%; margin-top: 0;
  font-size: calc(0.8125rem + var(--fs-bump, 0px));
  color: var(--muted, inherit);
}
:where(.ui-crash-details > summary) {
  cursor: pointer; display: inline-block; padding: var(--space-2, 0.5rem);
  min-height: 2rem; opacity: 0.85;
}
:where(.ui-crash-details > code) {
  display: block; margin-top: var(--space-2, 0.5rem); padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  text-align: left; white-space: pre-wrap; overflow-wrap: anywhere;
  max-height: 8rem; overflow: auto;
  font-family: var(--font-mono, ui-monospace, monospace); font-size: inherit;
  background: var(--surface-2, color-mix(in srgb, currentColor 6%, transparent));
  border-radius: var(--radius-sm, 6px);
}
`;
