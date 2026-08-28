import type { PlayerId } from "./config";
export declare const NAME_RE: RegExp;
/** Strips accents so "López" === "Lopez", case-insensitively. */
export declare const normalizeName: (s: unknown) => string;
/**
 * Suffix-tolerant key for matching a prose candidate to a search result. On top
 * of normalizeName's accent stripping it drops punctuation and generational
 * suffixes, so "Marvin Harrison" resolves to "Marvin Harrison Jr.".
 */
export declare const matchKey: (s: unknown) => string;
/**
 * Open-world extraction — used ONLY when no closed player set is supplied.
 * Where the caller knows its players, linking by membership in that set is
 * deterministic and needs no prose parsing.
 */
export declare function extractCandidates(text: unknown): string[];
/**
 * Closed-set resolution: given prose and a KNOWN set of players, return a
 * name → id map for the ones whose name appears in the text. The known set is
 * the source of truth, so this is deterministic — a leading word, a suffix or
 * an accent cannot cause the misses that open-world guessing does, because we
 * only ever look for names we already know exist.
 */
export declare function resolveKnownPlayers(text: unknown, players: Array<{
    name?: string | null;
    id?: PlayerId | null;
}> | null | undefined): Record<string, PlayerId>;
