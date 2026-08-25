export interface TabItem {
    id: string;
    label: string;
}
interface Props {
    tabs: TabItem[];
    active: string;
    onChange: (id: string) => void;
    className?: string;
}
/** The horizontal tab strip every screen uses; wraps on phones. */
export declare function Tabs({ tabs, active, onChange, className }: Props): import("react").JSX.Element;
export {};
