/** The one phrasing for a read that failed. */
export const couldNotLoad = (what: string) => `Couldn't load ${what}.`

/** The line a held-back retry shows while it counts down. */
export const busyLine = (seconds: number) => `Busy · try again in ${seconds}s`
