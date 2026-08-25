export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
/**
 * Owns the theme for a whole app: remembers the choice, follows the system
 * when asked to, and writes `data-theme` onto <html>.
 *
 * "system" is resolved here in JS rather than left to CSS on purpose. The dark
 * tokens hang off `[data-theme='dark']` and there is no prefers-color-scheme
 * fallback anywhere in the kit, so *removing* the attribute means light — not
 * "whatever the machine wants". The attribute is therefore always written.
 *
 * Call this once, near the root. `ThemeToggle` calls it for you.
 */
export declare function useTheme(storageKey?: string): {
    theme: ThemeChoice;
    resolved: ResolvedTheme;
    setTheme: (next: ThemeChoice) => void;
};
interface Props {
    /** Where the choice is remembered. Give each app its own key only if two
        apps share an origin and should disagree. */
    storageKey?: string;
    /** Icons only — for a cramped top bar. The words stay as labels. */
    compact?: boolean;
    /** Told after the change is applied; the toggle still owns the state. */
    onChange?: (theme: ThemeChoice) => void;
    className?: string;
}
/**
 * Light / Auto / Dark, as a segmented control.
 *
 * Three buttons rather than one that cycles: with three states a cycling
 * button cannot say what the next press will do, and "Auto" is invisible in a
 * two-state switch even though it is the right default.
 *
 * Self-contained — it calls useTheme() itself, so dropping it into a nav is
 * the whole integration. An app that wants the value elsewhere calls
 * useTheme() with the same storageKey.
 */
export declare function ThemeToggle({ storageKey, compact, onChange, className }: Props): import("react").JSX.Element;
export {};
