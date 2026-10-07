import { type ReactNode } from "react";
/** Settings → Appearance: light, dark or Phosphor. */
export declare function AppearanceCard({ appName }: {
    appName: string;
}): import("react").JSX.Element;
/**
 * Settings → Install the app. Uses the browser's install prompt where there is
 * one; on iPhone it says how. Hidden once installed, or after "Not now".
 */
export declare function InstallAppCard({ appName, storageKey, description }: {
    appName: string;
    storageKey: string;
    description?: ReactNode;
}): import("react").JSX.Element | null;
