/*
 * The boot guard, readable. ES5 only — this runs on whatever browser restored
 * the page, before any polyfill or bundle. Never edit bootGuard.min.ts by
 * hand: `npm run build` (scripts/build-boot-guard.mjs) minifies this into it.
 *
 * KIT_BOOT_GUARD_CONFIG is replaced by bootGuardScript() with
 * { a: app, b: build, e: endpoint, p: assetPrefix, t: timeoutMs, w: reloadWindowMs }.
 */
(function (c) {
  try {
    var w = window, d = document, L = location, n = navigator;
    if (w.__kitBootGuard) return;
    w.__kitBootGuard = 1;
    var booted = false, done = false, waited = false, failed = [], t0 = +new Date(), timer = 0, settle = 0;
    var origin = L.protocol + "//" + L.host;
    var key = "ui-kit-boot-reload-at:" + c.a;
    var ID = "kit-boot-guard";

    var onError = function (e) {
      try {
        var el = e.target, tag = el && el.tagName, url = "";
        if (tag == "SCRIPT") url = el.src;
        else if (tag == "LINK" && /(^|\s)(stylesheet|modulepreload)(\s|$)/i.test(el.rel)) url = el.href;
        // The app's own files only: images, media, other origins never count.
        if (booted || !url || url.indexOf(origin + c.p) !== 0) return;
        failed.push(url.slice(origin.length));
        // A stale page loses its JS and CSS together; gather them into one report.
        clearTimeout(settle);
        settle = setTimeout(function () { fail("asset"); }, 300);
      } catch (x) {}
    };

    var off = function () {
      clearTimeout(timer);
      clearTimeout(settle);
      w.removeEventListener("error", onError, true);
    };

    // initReporting() ran: the bundle is alive. Stand down, and take the
    // fallback away if it was already up (a slow bundle that made it after all).
    var stand = function () {
      booted = true;
      off();
      var f = d.getElementById(ID);
      if (f) f.parentNode.removeChild(f);
    };

    // installChunkReload's rule: once per window, remembered as a timestamp in
    // sessionStorage. Unlike it, no storage = no reload: nothing could stop the loop.
    var mayReload = function () {
      try {
        var s = w.sessionStorage, now = +new Date(), last = +(s.getItem(key) || 0);
        if (now - last >= 0 && now - last < c.w) return false;
        s.setItem(key, "" + now);
        return true;
      } catch (x) {
        return false;
      }
    };

    // One event, the contract's shape, the kit's endpoint. sendBeacon survives
    // the reload that follows; fetch keepalive when the beacon is refused.
    var send = function (reason, reload) {
      try {
        var ctx = {
          kind: "boot", reason: reason, failed: failed.slice(0, 10), reload: reload,
          route: L.pathname, ua: n.userAgent, online: n.onLine,
          waited_ms: new Date() - t0, ready_state: d.readyState
        };
        try { ctx.screen = screen.width + "x" + screen.height; } catch (x) {}
        if (c.b) ctx.build = c.b;
        var ev = {
          level: "error", source: "client", fingerprint: "boot",
          message: "The app's code didn't load", occurred_at: new Date().toISOString(), context: ctx
        };
        // The server mints an event_id when the browser can't (no randomUUID before iOS 15.4).
        try { ev.event_id = crypto.randomUUID(); } catch (x) {}
        var body = JSON.stringify({ events: [ev] });
        if (n.sendBeacon && n.sendBeacon(c.e, body)) return;
        if (w.fetch) fetch(c.e, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: body })["catch"](function () {});
      } catch (x) {}
    };

    // The fallback. No app CSS exists, so it brings its own, under the id so a
    // stray global rule can't reach it. Canvas/CanvasText + color-scheme follow
    // the phone's light/dark setting without naming a colour.
    var show = function () {
      try {
        if (booted || d.getElementById(ID)) return;
        if (!d.body) { d.addEventListener("DOMContentLoaded", show); return; }
        var r = d.createElement("div"), s = "#" + ID;
        r.id = ID;
        r.setAttribute("role", "alert");
        r.innerHTML = "<style>" +
          s + "{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:24px;color-scheme:light dark;background:Canvas;color:CanvasText;font:16px/1.5 system-ui,sans-serif;text-align:center}" +
          s + " h1{margin:20px 0 8px;font:inherit;font-size:21px;font-weight:600;line-height:1.3}" +
          s + " p{margin:0 0 28px;opacity:.7;max-width:18em}" +
          s + " svg{width:48px;height:48px;opacity:.5}" +
          s + " button{min-height:44px;padding:0 32px;border:0;border-radius:12px;background:CanvasText;color:Canvas;font:inherit;font-weight:600}" +
          "</style><div><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.75' stroke-linecap='round'><path d='M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5'/></svg><h1></h1>" +
          "<p>Something stopped it from loading. Trying again usually fixes it.</p><button type='button'>Try again</button></div>";
        r.getElementsByTagName("h1")[0].appendChild(d.createTextNode(c.a + " couldn’t start"));
        r.getElementsByTagName("button")[0].onclick = function () { L.reload(); };
        d.body.appendChild(r);
      } catch (x) {}
    };

    var fail = function (reason) {
      if (booted || done) return;
      done = true;
      off();
      var again = mayReload();
      send(reason, again ? "once" : "blocked");
      if (again) L.reload();
      else show();
    };

    // Still parsing the HTML at the deadline = a slow network, not a dead
    // bundle (module scripts run before DOMContentLoaded): wait once more.
    var tick = function () {
      if (booted || done) return;
      if (d.readyState == "loading" && !waited) { waited = true; timer = setTimeout(tick, c.t); return; }
      fail("timeout");
    };

    // initReporting() does `window.__kitBooted = true`; this turns it into stand().
    try {
      Object.defineProperty(w, "__kitBooted", {
        configurable: true,
        get: function () { return booted; },
        set: function (v) { if (v) stand(); }
      });
    } catch (x) {}
    w.addEventListener("error", onError, true);
    timer = setTimeout(tick, c.t);
  } catch (x) {}
})(KIT_BOOT_GUARD_CONFIG);
