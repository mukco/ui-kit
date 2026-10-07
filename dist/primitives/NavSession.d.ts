/**
 * The navbar's account controls — Settings, Sign out, and the look button
 * that steps light → dark → Phosphor — as icon buttons on desktop and as
 * labelled rows in the phone drawer. Pass them to NavBar's `right` and
 * `drawerFooter`. Pixel icons under Phosphor, line icons otherwise.
 */
interface Props {
    email?: string | null;
    onSettings: () => void;
    onSignOut: () => void;
}
export declare function NavSessionButtons({ email, onSettings, onSignOut }: Props): import("react").JSX.Element;
export declare function NavSessionDrawer({ onSettings, onSignOut }: Props): import("react").JSX.Element;
export {};
