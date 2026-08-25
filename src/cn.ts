/** Join class names, dropping falsy ones — the kit's only styling utility. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}
