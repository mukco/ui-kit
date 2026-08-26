/** Get the device into a state where a reload will actually serve the new build.
 *
 *  Separate from the toast because this is the part that was wrong, and it is
 *  the part worth testing. The toast only ever needed to ask "is there a new
 *  build" — the bug was reloading before the device could serve one.
 *
 *  Returns as soon as control has changed hands, or when there is nothing to
 *  wait for. Never rejects and never waits longer than `timeoutMs`: a toast
 *  that hangs is worse than one that reloads a moment early, because the second
 *  at least leaves the person somewhere they can press again.
 */
export declare function readyForNewBuild(timeoutMs?: number, nav?: Navigator | undefined): Promise<void>;
