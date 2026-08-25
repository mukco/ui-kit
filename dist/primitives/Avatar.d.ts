interface Props {
    name?: string | null;
    src?: string | null;
    /** Rendered size in px (width = height = size). */
    size?: number;
    className?: string;
}
/**
 * Round avatar: the photo when it loads, initials when it doesn't or when no
 * src exists. The box always occupies its size either way.
 */
export declare function Avatar({ name, src, size, className }: Props): import("react").JSX.Element;
export {};
