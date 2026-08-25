import { type ReactNode } from "react";
export interface ChatMessage {
    role: "user" | "assistant";
    content: ReactNode;
}
interface Props {
    /** Panel heading. */
    title?: string;
    messages: ChatMessage[];
    busy?: boolean;
    onSend: (text: string) => void;
    /** FAB label when closed (emoji or short glyph). */
    launcher?: ReactNode;
    className?: string;
}
/**
 * Floating assistant: a launcher bubble that opens a small chat panel.
 * The kit renders the conversation and input; the app decides what sending
 * a message actually does.
 */
export declare function Assistant({ title, messages, busy, onSend, launcher, className }: Props): import("react").JSX.Element;
export {};
