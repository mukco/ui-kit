export interface ComparisonRun {
    id: string;
    config: {
        model_type?: string;
        table?: string;
        target?: string;
        features?: string[];
        task?: string;
        test_size?: number;
    };
    result?: {
        task?: "regression" | "classification";
        metrics?: Record<string, number | undefined>;
        feature_importance?: Array<{
            feature: string;
            importance: number;
        }>;
    };
}
interface Props {
    runA?: ComparisonRun | null;
    runB?: ComparisonRun | null;
    onClose?: () => void;
}
/** Side-by-side diff of two training runs: config differences highlighted,
    best metric in green per row, feature importances overlaid. */
export declare function RunComparison({ runA, runB, onClose }: Props): import("react").JSX.Element | null;
export {};
