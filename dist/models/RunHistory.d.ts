import type { MlRunResult } from "./ModelResults";
export interface MlRun {
    id: string;
    created_at: string;
    config: {
        model_type?: string;
        table?: string;
        target?: string;
        features?: string[];
    };
    result?: MlRunResult;
}
interface Props {
    runs: MlRun[];
    loading?: boolean;
    selectedRunId?: string | null;
    compareRunId?: string | null;
    onLoad: (run: MlRun) => void;
    onDelete?: (id: string) => void;
    /** "Ask the assistant about this run" affordance; omit to hide. */
    onAsk?: (run: MlRun) => void;
    onCompare?: () => void;
}
/** Saved-run browser for an ML builder: mini bar chart of the primary metric
    across recent runs plus clickable run cards. Data comes in via props. */
export declare function RunHistory({ runs, loading, selectedRunId, compareRunId, onLoad, onDelete, onAsk, onCompare }: Props): import("react").JSX.Element;
export {};
