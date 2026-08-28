import type { PlayerId } from "./config"

/**
 * Pure helpers for finding player names in AI prose and matching them to
 * player-search results. Dependency-free (no React, no fetching) so they stay
 * unit-testable; AutoLinkedText composes them with the app's resolvePlayer.
 *
 * Both consuming apps had a byte-for-byte copy of this, differing only in
 * which players the comments used as examples.
 */

// Matches a player name: a leading token then 1–3 more tokens, so 2-to-4-word
// names link as one unit — "Mike Trout", "Lourdes Gurriel Jr.", "Elly De La
// Cruz", "Amon-Ra St. Brown". A token is initials ("J.D."), a generational
// suffix (Jr./Sr./II–IV, ordered longest-first so "III" cannot match as "II"),
// or a word.
//   - Unicode letter classes (\p{Lu}/\p{L}, needs the `u` flag) keep accented
//     names from truncating at the accent.
//   - The word class excludes "." so a word cannot swallow a sentence-ending
//     period and bridge two clauses ("Josh Allen. Puka Nacua" stays two names).
//   - Connectors are literal spaces (not \s) to prevent newline-spanning matches.
const TOKEN = String.raw`(?:(?:\p{Lu}\.){1,3}|\p{Lu}[\p{L}'-]+)`
const SUFFIX = String.raw`(?:Jr|Sr|III|IV|II)\.?`
export const NAME_RE = new RegExp(String.raw`\b${TOKEN}(?: +(?:${SUFFIX}|${TOKEN})){1,3}`, "gu")

/** Strips accents so "López" === "Lopez", case-insensitively. */
export const normalizeName = (s: unknown): string =>
  (s ?? "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/**
 * Suffix-tolerant key for matching a prose candidate to a search result. On top
 * of normalizeName's accent stripping it drops punctuation and generational
 * suffixes, so "Marvin Harrison" resolves to "Marvin Harrison Jr.".
 */
export const matchKey = (s: unknown): string =>
  normalizeName(s)
    .replace(/[^a-z ]/g, " ")
    .replace(/\b(jr|sr|iii|iv|ii)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()

/**
 * Open-world extraction — used ONLY when no closed player set is supplied.
 * Where the caller knows its players, linking by membership in that set is
 * deterministic and needs no prose parsing.
 */
export function extractCandidates(text: unknown): string[] {
  if (!text) return []
  const raw: string[] = (String(text).match(NAME_RE) || []).map((n) => n.replace(/'s$/, ""))
  return [...new Set(raw)].slice(0, 8)
}

/**
 * Closed-set resolution: given prose and a KNOWN set of players, return a
 * name → id map for the ones whose name appears in the text. The known set is
 * the source of truth, so this is deterministic — a leading word, a suffix or
 * an accent cannot cause the misses that open-world guessing does, because we
 * only ever look for names we already know exist.
 */
export function resolveKnownPlayers(
  text: unknown,
  players: Array<{ name?: string | null; id?: PlayerId | null }> | null | undefined,
): Record<string, PlayerId> {
  const map: Record<string, PlayerId> = {}
  if (!text || !Array.isArray(players)) return map
  const body = String(text)
  const tKey = matchKey(body)
  for (const p of players) {
    if (p?.name == null || p?.id == null) continue
    if (body.includes(p.name) || tKey.includes(matchKey(p.name))) map[p.name] = p.id
  }
  return map
}
