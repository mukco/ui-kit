import { type ReactNode } from "react";
/**
 * Settings → Appearance: light, dark or Phosphor. No sentence under the title
 * by default: three named options say what they are. An app that has a
 * genuinely non-obvious point to make passes `description`.
 */
export declare function AppearanceCard({ description }?: {
    appName?: string;
    description?: ReactNode;
}): import("react").JSX.Element;
/**
 * Settings → Install the app. Uses the browser's install prompt where there is
 * one; on iPhone it says how. Hidden once installed, or after "Not now". The
 * title and the Install button say what it does, so there is no description
 * unless the app passes one.
 */
export declare function InstallAppCard({ storageKey, description }: {
    appName?: string;
    storageKey: string;
    description?: ReactNode;
}): import("react").JSX.Element | null;
