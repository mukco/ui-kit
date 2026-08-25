/** Day/month label helpers so the kit needs no date library. */
export declare function parseDay(iso: string): Date | null;
/** "Aug 24" */
export declare function fmtDay(iso: string): string;
/** "8/24" */
export declare function fmtShortDay(iso: string): string;
