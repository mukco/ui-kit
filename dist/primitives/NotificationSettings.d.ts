import { type ReactNode } from "react";
import { type NotifyPrefs, type PushClient } from "./push";
interface Props {
    client: PushClient;
    /** The user's alert switches (client.notify.get), loaded by the app. */
    prefs: NotifyPrefs | undefined;
    /** Save one switch; the app writes the answer back to its cache. */
    onSetKind: (kind: string, on: boolean) => void;
    /** Named in the iPhone hint ("add Hoops to your Home Screen"). */
    appName: string;
    description?: ReactNode;
}
/**
 * Family Hub's notification settings: this device on or off, then one switch
 * per alert. The device switch must be tapped (iOS refuses a prompt without
 * one); on an iPhone it only works in the app added to the Home Screen.
 * Hidden when the server says push isn't set up.
 */
export declare function NotificationSettings({ client, prefs, onSetKind, appName, description }: Props): import("react").JSX.Element | null;
export {};
