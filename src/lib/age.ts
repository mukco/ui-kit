/**
 * "3h ago" — the useful form for anything with a timestamp on it.
 *
 * TriageList had this privately and the news panel needed the same thing, so
 * it moved here rather than being written a second time. Consumers had been
 * pulling date-fns in for `formatDistanceToNow`; this is the one shape of it
 * the kit actually renders, and it costs no dependency.
 */
export function age(iso: string | null | undefined): string | null {
  if (!iso) return null
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return null
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 90) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${days}d ago` : `${Math.round(days / 30)}mo ago`
}
