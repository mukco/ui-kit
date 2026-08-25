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
const IDENTITY = {
    photoUrl: () => "",
    logoUrl: () => "",
};
export function configureSports(identity) {
    Object.assign(IDENTITY, identity);
}
export function sportsIdentity() {
    return IDENTITY;
}
