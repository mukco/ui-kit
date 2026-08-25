/**
 * Sport identity adapters. Kit components never hardcode where photos, logos,
 * or player pages live; each app configures that once at boot and futbol is a
 * new config object, not a fork.
 *
 * Set it in the app entrypoint:
 *
 *   configureSports({
 *     photoUrl: (id, size) => `https://cdn.example/players/${id}.png?w=${size}`,
 *     logoUrl: (teamId) => `https://cdn.example/teams/${teamId}.svg`,
 *   })
 */
export type PlayerId = number | string;
export interface SportsIdentity {
    /** Headshot/photo URL for a player id (0/unknown should return a silhouette). */
    photoUrl: (id: PlayerId | null | undefined, size?: number) => string;
    /** Team crest/logo URL for a team id. */
    logoUrl: (teamId: string | number) => string;
    /** Where a player profile lives; absent → names render as plain text. */
    playerHref?: (id: PlayerId) => string;
    /** Where a team profile lives; absent → teams render unlinked. */
    teamHref?: (teamId: string | number) => string;
    /** Name → id resolution for rows that only have a name; absent → no lookup. */
    resolvePlayer?: (name: string) => Promise<{
        id: PlayerId;
    } | null>;
}
export declare function configureSports(identity: Partial<SportsIdentity>): void;
export declare function sportsIdentity(): SportsIdentity;
