import type { GlossaryEntry } from "../models/glossary";
export type GlossaryTone = "red" | "amber" | "green" | "muted";
interface Props {
    hint?: GlossaryEntry;
    /** Colors the trigger ring and the note block. Valence, not decoration —
        e.g. a stat's live diagnosis: red = genuinely below replacement, amber =
        injury/part-time/cold, green = healthy and productive. */
    tone?: GlossaryTone;
    /** A one-line callout above the definition — the diagnosis itself, where
        the definition explains the stat in general. */
    note?: {
        label: string;
        detail?: string;
    };
    /** Widen the bubble for content that needs more room (a rendered formula). */
    maxWidth?: number;
    className?: string;
}
/** Portal-positioned "i" tooltip for glossary concepts — survives scroll and
    overflow:hidden contexts that defeat ordinary CSS bubbles. */
export declare function GlossaryTip({ hint, tone, note, maxWidth, className }: Props): import("react").JSX.Element | null;
export {};
