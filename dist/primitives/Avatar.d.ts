interface Props {
    name?: string | null;
    src?: string | null;
    /**
     * Rendered size in px (width = height = size). Pass `null` to set no inline
     * dimensions at all and let a className govern — a consumer whose avatars are
     * sized by CSS (per context, per breakpoint) cannot use an inline value,
     * because inline always wins.
     */
    size?: number | null;
    className?: string;
}
/**
 * Round avatar: the photo when it loads, initials when it doesn't or when no
 * src exists. The box always occupies its size either way.
 */
export declare function Avatar({ name, src, size, className }: Props): import("react").JSX.Element;
export {};
