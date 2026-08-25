import { ClassBreakdownChart } from "./ClassBreakdownChart";
export interface FeatureImportance {
    feature: string;
    importance: number;
}
export interface MlRunResult {
    model_type: string;
    task: "regression" | "classification";
    metrics: any;
    confusion_matrix?: number[][];
    confusion_labels?: string[];
    class_breakdown?: React.ComponentProps<typeof ClassBreakdownChart>["classBreakdown"];
    test_predictions?: {
        y_true: number[];
        y_pred: number[];
        sampled?: boolean;
    };
    feature_importance?: FeatureImportance[];
    loss_history?: number[];
    parameter_count?: number;
    architecture?: string;
    train_samples?: number;
    test_samples?: number;
    training_time_ms?: number;
    target?: string;
}
/** The full training-result readout: summary chips, metrics with hints,
    loss curve, feature importance, pred-vs-actual or per-class breakdown,
    and the confusion matrix. */
export declare function ModelResults({ results }: {
    results: MlRunResult;
}): import("react").JSX.Element;
