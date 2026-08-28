export interface SegmentedOption {
    id: string;
    label: string;
}
interface Props {
    options: SegmentedOption[];
    active: string;
    onChange: (id: string) => void;
    className?: string;
}
/**
 * A compact inline toggle between a few short options — switching a metric
 * or view inside a card header. Not Tabs: that's page-level navigation with
 * a full-height strip and an underline; this is a small pill control that
 * lives inside other content.
 */
export declare function SegmentedControl({ options, active, onChange, className }: Props): import("react").JSX.Element;
export {};
