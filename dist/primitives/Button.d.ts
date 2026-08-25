import type { ReactNode } from "react";
export type ButtonTone = "primary" | "quiet" | "danger";
interface Props {
    children: ReactNode;
    onClick?: () => void;
    /** Renders an anchor instead. An action that goes somewhere should be a
        link: it opens in a new tab, it can be copied, and it says where it goes. */
    href?: string;
    external?: boolean;
    tone?: ButtonTone;
    size?: "sm" | "md";
    disabled?: boolean;
    title?: string;
    type?: "button" | "submit";
    className?: string;
}
/**
 * The button.
 *
 * The kit shipped a chip, a toggle, a tab and a nav item and never a button,
 * so every app invented one — `.btn`, `.btn-quiet`, `.mac-btn`, and inside
 * this kit a `.ui-triage-action` that was a button in all but name and matched
 * none of them. That is why the estate's actions looked like they came from a
 * different application: they did.
 *
 * Tones rather than colours, so an app cannot ask for a red button that means
 * nothing. Sizes rather than pixels, because the only two that have ever been
 * wanted are "in a row of text" and "on its own".
 */
export declare function Button({ children, onClick, href, external, tone, size, disabled, title, type, className, }: Props): import("react").JSX.Element;
export {};
