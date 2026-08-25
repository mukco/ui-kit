import type { GlossaryEntry } from "../models/glossary";
/** Portal-positioned "i" tooltip for ML concepts — survives scroll and
    overflow:hidden contexts that defeat ordinary CSS bubbles. */
export declare function GlossaryTip({ hint }: {
    hint?: GlossaryEntry;
}): import("react").JSX.Element | null;
