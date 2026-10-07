// Screenshot baselines for every section of the playground's library page —
// each shared component, in light and Phosphor, at a phone and a desktop
// width — compared against the committed PNGs in test/visual/baselines.
//
//   node scripts/visual.mjs            compare; exits 1 on a difference
//   node scripts/visual.mjs --update   rewrite the baselines
//
// Baselines are only meaningful from the machine that made them (fonts and
// anti-aliasing differ between machines), so CI makes and checks them: run
// the "Update visual baselines" workflow to commit new ones on purpose.
//
// The page is made deterministic before it renders: a frozen clock, a seeded
// Math.random, no CSS animation, and a pause for charts to finish drawing.
import { chromium } from "playwright"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
import { createServer } from "vite"
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs"

const UPDATE = process.argv.includes("--update")
const BASE = "test/visual/baselines"
const OUT = "test/visual/out"
// Pixels allowed to differ in a section: the larger of a small count and a
// tiny share — enough to absorb anti-aliasing noise in chart canvases, small
// enough to catch two digits changing colour (about 200 pixels).
const NOISE_PIXELS = 25
const NOISE_SHARE = 0.00005
const WIDTHS = [390, 1280]
const THEMES = ["light", "phosphor"]
const FIXED_TIME = new Date("2026-10-07T18:00:00Z").getTime()

mkdirSync(BASE, { recursive: true })
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const server = await createServer({ configFile: "vite.config.ts", server: { port: 5300, strictPort: true }, logLevel: "error" })
await server.listen()
const browser = await chromium.launch()
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
const failures = []
const missing = []
let compared = 0

try {
  for (const width of WIDTHS) for (const theme of THEMES) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" })
    await ctx.addInitScript(([t]) => {
      localStorage.setItem("uidemo-theme", t)
      let s = 42
      Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
    }, [theme])
    const page = await ctx.newPage()
    await page.clock.setFixedTime(FIXED_TIME)
    await page.goto("http://localhost:5300/library.html", { waitUntil: "networkidle" })
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(2000)
    const sections = page.locator("section.uidemo-section")
    const n = await sections.count()
    for (let i = 0; i < n; i++) {
      const sec = sections.nth(i)
      const title = (await sec.locator("h2").first().textContent().catch(() => null)) || `section-${i}`
      const name = `${String(i).padStart(2, "0")}-${slug(title)}--${theme}-${width}.png`
      await sec.scrollIntoViewIfNeeded()
      const shot = PNG.sync.read(await sec.screenshot({ animations: "disabled" }))
      const basePath = `${BASE}/${name}`
      if (UPDATE || !existsSync(basePath)) {
        writeFileSync(basePath, PNG.sync.write(shot))
        if (!UPDATE) missing.push(name)
        continue
      }
      const base = PNG.sync.read(readFileSync(basePath))
      compared++
      if (base.width !== shot.width || base.height !== shot.height) {
        failures.push(`${name}: size ${base.width}x${base.height} -> ${shot.width}x${shot.height}`)
        writeFileSync(`${OUT}/${name}`, PNG.sync.write(shot))
        continue
      }
      const diff = new PNG({ width: base.width, height: base.height })
      const changed = pixelmatch(base.data, shot.data, diff.data, base.width, base.height, { threshold: 0.1 })
      if (changed > Math.max(NOISE_PIXELS, base.width * base.height * NOISE_SHARE)) {
        failures.push(`${name}: ${changed} pixels differ`)
        writeFileSync(`${OUT}/${name}`, PNG.sync.write(shot))
        writeFileSync(`${OUT}/${name.replace(".png", ".diff.png")}`, PNG.sync.write(diff))
      }
    }
    await ctx.close()
  }
} finally {
  await browser.close()
  await server.close()
}

if (UPDATE) { console.log("baselines updated"); process.exit(0) }
console.log(`${compared} sections compared`)
if (missing.length) console.log(`${missing.length} sections have no baseline yet — run the "Update visual baselines" workflow to add them`)
if (failures.length) {
  console.log(`${failures.length} differ from their baselines (images in ${OUT}):\n  ` + failures.join("\n  "))
  process.exit(1)
}
console.log("no visual changes")
