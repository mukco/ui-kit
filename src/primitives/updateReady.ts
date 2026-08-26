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
export async function readyForNewBuild(timeoutMs = 5_000, nav: Navigator | undefined = typeof navigator === "undefined" ? undefined : navigator): Promise<void> {
  const sw = nav && "serviceWorker" in nav ? nav.serviceWorker : undefined
  // Nothing is intercepting the navigation, so the reload fetches the shell
  // itself. That is only safe because the shell is served no-cache; if it were
  // not, this is where a year-old copy would come back instead.
  if (!sw) return

  const registration = await sw.getRegistration()
  if (!registration) return

  // A newer worker is sitting waiting for every tab to close — which on an
  // installed app may be never. Ask it to take over now.
  if (registration.waiting && sw.controller) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" })
    return waitForControllerChange(sw, timeoutMs)
  }

  // Nothing waiting yet: the poll may have noticed the deploy before this
  // device fetched it. Ask, then wait for whatever turns up.
  await registration.update().catch(() => undefined)

  if (registration.waiting && sw.controller) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" })
  } else if (!registration.installing && !registration.waiting) {
    // The build id differs but this device has no update to apply. Reload and
    // let the network settle it rather than waiting for an event that will
    // never fire.
    return
  }

  return waitForControllerChange(sw, timeoutMs)
}

function waitForControllerChange(sw: ServiceWorkerContainer, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false
    // Cleared on the way out. Without this the timer outlives the handover it
    // was insuring against — harmless in a browser, but it kept the test
    // runner alive for the full timeout, which is the same bug wearing a
    // different hat.
    let timer: ReturnType<typeof setTimeout>
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      sw.removeEventListener("controllerchange", finish)
      resolve()
    }
    sw.addEventListener("controllerchange", finish)
    timer = setTimeout(finish, timeoutMs)
  })
}
