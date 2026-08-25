/** Join class names, dropping falsy ones — the kit's only styling utility. */
export function cn(...parts) {
    return parts.filter(Boolean).join(" ");
}
