import type { ReactNode } from "react";
export type SettingsGroupTone = "brand" | "ok" | "warn" | "info";
interface Props {
    title: ReactNode;
    description?: ReactNode;
    /** A line icon in a tinted tile beside the title (baseball's settings look). */
    icon?: ReactNode;
    tone?: SettingsGroupTone;
    /** Status beside the title, e.g. a Chip saying "Set". */
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
}
/** One titled card of SettingRows — the unit baseball's settings page stacks.
    Compose groups under a PageHeader and you have the whole screen. */
export declare function SettingsGroup({ title, description, icon, tone, aside, children, className }: Props): import("react").JSX.Element;
export {};
