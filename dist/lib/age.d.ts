/**
 * "3h ago" — the useful form for anything with a timestamp on it.
 *
 * TriageList had this privately and the news panel needed the same thing, so
 * it moved here rather than being written a second time. Consumers had been
 * pulling date-fns in for `formatDistanceToNow`; this is the one shape of it
 * the kit actually renders, and it costs no dependency.
 */
export declare function age(iso: string | null | undefined): string | null;
