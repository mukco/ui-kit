import type { ReactNode } from "react";
interface Props {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    className?: string;
}
/** One titled card of SettingRows — the unit baseball's settings page stacks.
    Compose groups under a PageHeader and you have the whole screen. */
export declare function SettingsGroup({ title, description, children, className }: Props): import("react").JSX.Element;
export {};
