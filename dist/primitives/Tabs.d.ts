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
/**
 * The horizontal tab strip every screen uses; wraps on phones.
 *
 * role="tablist" tells assistive tech this is one tab stop navigated with the
 * arrow keys. It said so and implemented neither, so a screen reader user was
 * told how the widget worked and then found it did not.
 */
export declare function Tabs({ tabs, active, onChange, className }: Props): import("react").JSX.Element;
export {};
