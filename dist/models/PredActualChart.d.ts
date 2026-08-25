interface Props {
    testPredictions: {
        y_true: number[];
        y_pred: number[];
        sampled?: boolean;
    };
    target?: string;
}
/** Predicted-vs-actual scatter against the diagonal, plus the residual
    histogram — the two plots that grade a regression honestly. */
export declare function PredActualChart({ testPredictions, target }: Props): import("react").JSX.Element;
export {};
