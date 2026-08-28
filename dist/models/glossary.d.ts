import type { ReactNode } from "react";
export interface GlossaryEntry {
    label: string;
    definition: string;
    formula?: ReactNode;
    interpretation?: string;
}
export declare const ML_GLOSSARY: Record<string, GlossaryEntry>;
