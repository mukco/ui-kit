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
