interface Props {
    /** Return the remote build id; polled periodically and on tab focus. */
    getRemoteBuild: () => Promise<string | null | undefined>;
    localBuild: string | undefined;
    appName?: string;
    intervalMs?: number;
}
/** "A new version has been deployed — Refresh?" toast. Compares a polled
    remote build id against the one this page loaded with; the button reloads.
    Pass localBuild from your build pipeline (e.g. __BUILD_ID__ define) and
    point getRemoteBuild at version.json or /api/build. */
export declare function UpdateToast({ getRemoteBuild, localBuild, appName, intervalMs }: Props): import("react").JSX.Element | null;
export {};
