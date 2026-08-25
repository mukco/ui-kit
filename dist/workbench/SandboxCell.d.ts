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
    /** Render the first "name"-ish column as a link when a paired id column exists. */
    renderNameLink?: (name: string, id: unknown) => React.ReactNode;
    dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
}
declare function SandboxCellInner({ cell, index, onRun, onUpdateSql, onUpdateTitle, onDelete, onFocus, schema, renderNameLink, dragHandleProps, }: Props): import("react").JSX.Element;
export declare const SandboxCell: import("react").MemoExoticComponent<typeof SandboxCellInner>;
export {};
