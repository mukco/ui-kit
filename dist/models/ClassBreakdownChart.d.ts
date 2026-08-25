export interface ClassBreakdownEntry {
    class: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
}
interface Props {
    classBreakdown: ClassBreakdownEntry[];
}
/** Per-class precision / recall / F1 with support in the tooltip — where a
    classifier is quietly failing on rare classes. */
export declare function ClassBreakdownChart({ classBreakdown }: Props): import("react").JSX.Element | null;
export {};
