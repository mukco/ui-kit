#!/usr/bin/env node
/**
 * The kit's stylesheets, into dist/.
 *
 *   dist/ui.css             everything: tokens, components and the page
 *                           globals (base type on html/body, the focus ring,
 *                           scrollbars, the input-zoom floor, …). What a
 *                           template app imports.
 *   dist/ui-components.css  the same without the page globals: tokens and
 *                           ui-* components only, nothing that styles an
 *                           element the kit did not draw. For an app with its
 *                           own design system that wants kit components
 *                           inside it (Family Hub, 2026-10-09).
 *   dist/phosphor.css       the Phosphor skin, as written.
 *
 * Page globals are marked in src/ui.css with a pair of comments:
 *   /* @page-globals { *\/ … /* } @page-globals *\/
 * Anything that styles html, body, *, or a bare element goes between them.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"

const START = "/* @page-globals { */"
const END = "/* } @page-globals */"

const ui = readFileSync("src/ui.css", "utf8")
let out = ""
let at = 0
for (;;) {
  const a = ui.indexOf(START, at)
  if (a === -1) { out += ui.slice(at); break }
  const b = ui.indexOf(END, a)
  const next = ui.indexOf(START, a + START.length)
  if (b === -1 || (next !== -1 && next < b)) throw new Error(`src/ui.css: unbalanced ${START} at ${ui.slice(0, a).split("\n").length}`)
  out += ui.slice(at, a)
  at = b + END.length
}
if (out.includes(END)) throw new Error(`src/ui.css: a stray ${END}`)

mkdirSync("dist", { recursive: true })
copyFileSync("src/ui.css", "dist/ui.css")
writeFileSync("dist/ui-components.css", out)
copyFileSync("src/phosphor.css", "dist/phosphor.css")
