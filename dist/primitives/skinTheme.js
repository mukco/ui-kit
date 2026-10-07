import { useSyncExternalStore } from "react";
export const SKIN_THEMES = [
    { id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "phosphor", label: "Phosphor" },
];
/** Family Hub's faces, fetched only when somebody picks Phosphor. */
export const PHOSPHOR_FONTS_HREF = "https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400;600;700&family=VT323&display=swap";
let options = null;
const listeners = new Set();
function read() {
    if (typeof document === "undefined")
        return "light";
    const root = document.documentElement;
    if (root.dataset.skin === "phosphor")
        return "phosphor";
    return root.dataset.theme === "dark" ? "dark" : "light";
}
let current = read();
export function configureSkinTheme(next) {
    options = next;
    current = read();
}
export function applySkinTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme === "light" ? "light" : "dark";
    if (theme === "phosphor") {
        root.dataset.skin = "phosphor";
        if (!document.getElementById("phosphor-fonts")) {
            const link = document.createElement("link");
            link.id = "phosphor-fonts";
            link.rel = "stylesheet";
            link.href = PHOSPHOR_FONTS_HREF;
            document.head.appendChild(link);
        }
    }
    else {
        delete root.dataset.skin;
    }
    const colors = options?.metaColors;
    if (colors) {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors[theme]);
    }
}
export function setSkinTheme(theme) {
    current = theme;
    applySkinTheme(theme);
    try {
        if (options)
            window.localStorage.setItem(options.storageKey, theme);
    }
    catch { /* private mode */ }
    listeners.forEach((l) => l());
}
/** The look after this one, for a single cycling button. */
export function nextSkinTheme(theme) {
    const i = SKIN_THEMES.findIndex((t) => t.id === theme);
    return SKIN_THEMES[(i + 1) % SKIN_THEMES.length].id;
}
export function useSkinTheme() {
    const theme = useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => current, () => "light");
    return [theme, setSkinTheme];
}
