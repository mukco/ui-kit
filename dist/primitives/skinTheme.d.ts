/**
 * The app's look: light, dark, or Phosphor — Family Hub's amber CRT. Phosphor
 * is dark with a skin on top: data-theme="dark" keeps every dark-mode rule,
 * data-skin="phosphor" adds the amber, the pixel type and the windows
 * (ui-kit/phosphor.css). One store for the whole page, configured once at boot:
 *
 *   configureSkinTheme({ storageKey: "football-theme", metaColors: { light, dark, phosphor } })
 *
 * The app's index.html applies the saved choice before first paint (see
 * PHOSPHOR_FONTS_HREF for the fonts link it writes); this keeps it and the
 * page in step afterwards. Separate from useTheme/ThemeToggle, which know
 * light/dark/system only.
 */
export type SkinTheme = "light" | "dark" | "phosphor";
export declare const SKIN_THEMES: {
    id: SkinTheme;
    label: string;
}[];
/** Family Hub's faces, fetched only when somebody picks Phosphor. */
export declare const PHOSPHOR_FONTS_HREF = "https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400;600;700&family=VT323&display=swap";
export interface SkinThemeOptions {
    /** localStorage key the choice is kept under (and index.html reads). */
    storageKey: string;
    /** <meta name="theme-color"> per look (the browser chrome around the app). */
    metaColors: {
        light: string;
        dark: string;
        phosphor: string;
    };
}
export declare function configureSkinTheme(next: SkinThemeOptions): void;
export declare function applySkinTheme(theme: SkinTheme): void;
export declare function setSkinTheme(theme: SkinTheme): void;
/** The look after this one, for a single cycling button. */
export declare function nextSkinTheme(theme: SkinTheme): SkinTheme;
export declare function useSkinTheme(): [SkinTheme, (t: SkinTheme) => void];
