import { type ReactNode } from "react";
/** Bridge between a SQL workbench surface and an assistant panel: cells can
    push a question with context, and something above owns the actual chat. */
interface SandboxContextValue {
    currentSql: string;
    setCurrentSql: (sql: string) => void;
    currentError: string | null;
    setCurrentError: (err: string | null) => void;
    pendingQuestion: {
        text: string;
    } | null;
    setPendingQuestion: (q: {
        text: string;
    } | null) => void;
    loadSqlRef: React.MutableRefObject<((sql: string) => void) | null>;
    loadSql: (sql: string) => void;
    openAssistantRef: React.MutableRefObject<((open: boolean) => void) | null>;
    askAssistant: (text: string) => void;
}
export declare function SandboxProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useSandbox(): SandboxContextValue | null;
export {};
