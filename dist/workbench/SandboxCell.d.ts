import { type HTMLAttributes } from "react";
export interface CellRecord {
    id: string;
    type?: "sql" | "md";
    sql: string;
    title?: string;
}
export interface QueryResult {
    columns: string[];
    rows: unknown[][];
    rowCount: number;
    runtimeMs: number;
    truncated?: boolean;
}
interface Props {
    cell: CellRecord;
    index: number;
    /** Run SQL and return the result set — the app owns the database call. */
    onRun: (sql: string) => Promise<QueryResult>;
    onUpdateSql: (sql: string) => void;
    onUpdateTitle?: (title: string) => void;
    onDelete?: () => void;
    onFocus?: () => void;
    /** Optional CodeMirror schema for completions: {table: {column: type}} */
    schema?: Record<string, Record<string, string>>;
    /** Table names for completion. Was hardcoded to [], so a consumer with a
        schema still got no table completions. */
    tables?: string[];
    /** Told about a failed query, for a page-level error surface. */
    onError?: (message: string) => void;
    /**
     * Offer "ask the assistant about this error" under a failure, with a prompt
     * the app then routes wherever its assistant lives.
     */
    askAssistant?: (prompt: string) => void;
    /** Render the first "name"-ish column as a link when a paired id column exists. */
    renderNameLink?: (name: string, id: unknown) => React.ReactNode;
    dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}
declare function SandboxCellInner({ cell, index, onRun, tables, onError, askAssistant, onUpdateSql, onUpdateTitle, onDelete, onFocus, schema, renderNameLink, dragHandleProps, }: Props): import("react").JSX.Element;
export declare const SandboxCell: import("react").MemoExoticComponent<typeof SandboxCellInner>;
export {};
