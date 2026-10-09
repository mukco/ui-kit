import { Component, type ErrorInfo, type ReactNode } from "react";
export interface ErrorBoundaryFallbackProps {
    error: unknown;
    /** Clear the error and render the children again. */
    reset: () => void;
    /** The boundary's name, as reported. */
    name: string;
}
export interface ErrorBoundaryProps {
    /** Which boundary caught it — "routes", "player-card". Sent with the report. */
    name: string;
    /** Replaces the default fallback. A node, or a function given the error and a reset. */
    fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
    /** Called after "Try again" clears the error — clear whatever state broke it. */
    onReset?: () => void;
    children?: ReactNode;
}
interface State {
    error: unknown;
    failed: boolean;
}
/**
 * Catches a render error below it, reports it (kind: boundary, with the
 * component stack) and shows a way out instead of a blank page. A stale
 * chunk after a deploy reloads once instead, when installChunkReload() is on.
 *
 * Reporting is a no-op until initReporting() runs, so the boundary is safe to
 * use anywhere — the playground, tests, an app that has not wired reporting.
 */
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    state: State;
    static getDerivedStateFromError(error: unknown): State;
    componentDidCatch(error: unknown, info: ErrorInfo): void;
    reset: () => void;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
}
/**
 * The default fallback. Works without ui.css: its own rules ride along in a
 * <style> tag under :where(), so they carry zero specificity — with the kit's
 * stylesheet loaded, ui.css and phosphor.css (the .ui-btn frame, the chrome
 * face) win; without it (Family Hub, NoFuss) these defaults stand, reading the
 * host's --text / --surface / --border when it has them and currentColor when
 * it does not.
 */
export declare function CrashFallback({ error, onReset }: {
    error: unknown;
    onReset?: () => void;
}): import("react").JSX.Element;
export {};
