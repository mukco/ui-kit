import { type ReactNode } from "react";
export declare const MOBILE_BREAKPOINT = 640;
export declare function isMobileViewport(): boolean;
export declare function panelGeometry({ position, width, height, available }: any): {
    left: any;
    top: any;
    width: any;
    height: any;
    maxWidth: string;
    maxHeight: string;
};
export declare function clampPosition(x: any, y: any, w: any, h: any): {
    x: number;
    y: number;
};
interface MentionResult {
    id: any;
    name: string;
    kind: string;
}
export interface FloatingAssistantProps {
    /** The route the app is currently on. Passed through to `deriveContext` on
     *  every ask, so a route-driven context stays in sync with navigation. */
    pathname: string;
    /** Maps the current route to a context object merged into every ask. Called
     *  fresh at ask time (not memoized away), so a closure over other live app
     *  state — a SQL sandbox's current query, say — stays current. `: any`
     *  because the shape is entirely the app's. */
    deriveContext: (pathname: string) => any;
    /** The app's own API call. Receives the question text, the built context,
     *  and the prior message history (the welcome message excluded). Resolves
     *  to `{ answer, tools?, charts? }` — shape is the app's, hence `: any`. */
    onAsk: (question: string, context: any, history: any[]) => Promise<any>;
    /** Panel title, launcher label, and the default session title. */
    title?: string;
    welcome?: string;
    /** localStorage keys are `${storagePrefix}-position`, `-sessions`, etc. */
    storagePrefix: string;
    /** Drives the `@mention` autocomplete in the composer. Absent → no mention UI. */
    mentionSearch?: (query: string) => Promise<MentionResult[]>;
    /** Renders a message's text (markdown, links, syntax highlighting — the
     *  app's choice). Absent → plain text. */
    renderMarkdown?: (text: string) => ReactNode;
    /** Renders one chart payload. Absent → its title as plain text. */
    renderChart?: (chart: any) => ReactNode;
    /** Extra per-message buttons, appended after the built-in "Load in
     *  Sandbox" action — e.g. a "Save to Obsidian" button. */
    messageActions?: (message: any) => ReactNode;
    /** Called with a fenced ```sql block's contents when the user clicks "Load
     *  in Sandbox" on a message. Absent → the button doesn't render. */
    onOpenSandbox?: (sql: string) => void;
    /** External signal to expand the panel — e.g. a page's own "ask" control. */
    open?: boolean;
    /** Auto-asks a question — optionally with a context override — in the
     *  current session, e.g. when a long-running job elsewhere in the app
     *  finishes and the result should be explained without the user asking.
     *  Consumed once. */
    autoAsk?: {
        initialMessage: string;
        context?: any;
    } | null;
    onAutoAskConsumed?: () => void;
    /** Runs a prompt in a brand-new session — e.g. "open in chat" from a
     *  notification. Consumed once. */
    pendingPrompt?: string | null;
    onPendingPromptConsumed?: () => void;
    /** Drops text into the composer without submitting it — e.g. a SQL
     *  workbench cell's "Ask assistant" button. The user can still edit before
     *  sending. Consumed once. */
    prefillPrompt?: string | null;
    onPrefillPromptConsumed?: () => void;
}
export declare function FloatingAssistant({ pathname, deriveContext, onAsk, title, welcome, storagePrefix, mentionSearch, renderMarkdown, renderChart, messageActions, onOpenSandbox, open, autoAsk, onAutoAskConsumed, pendingPrompt, onPendingPromptConsumed, prefillPrompt, onPrefillPromptConsumed, }: FloatingAssistantProps): import("react").JSX.Element;
export {};
