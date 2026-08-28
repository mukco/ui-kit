#!/usr/bin/env node
/**
 * Fails when a consuming app hands a kit component one of its own CSS classes.
 *
 *   <Card className="bb-st-lg" />        <-- bespoke styling of a shared thing
 *   <PanelRow className="fb-fs-12" />
 *
 * That is the shape every divergence in these two apps started as. A kit
 * component styled from the app's own stylesheet is a kit component that looks
 * different in each app, and the next person to fix it fixes it once and misses
 * the other. If a component needs to vary, it needs a prop; if the variation is
 * one app's alone, it needs its own component.
 *
 * Run from a consumer:  node node_modules/@mukco/ui-kit/scripts/check-consumer.mjs src bb
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const [, , root = "src", prefix] = process.argv
if (!prefix) {
  console.error("usage: check-consumer.mjs <src-dir> <app-class-prefix>")
  process.exit(2)
}

const files = []
;(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    if (statSync(p).isDirectory()) walk(p)
    else if (p.endsWith(".tsx")) files.push(p)
  }
})(root)

const violations = []
for (const file of files) {
  const src = readFileSync(file, "utf8")
  const imported = new Set()
  for (const m of src.matchAll(/import \{([^}]*)\} from ["']@mukco\/ui-kit["']/gs)) {
    for (let n of m[1].split(",")) {
      n = n.trim().replace(/^type /, "")
      if (n) imported.add(n.split(" as ").pop().trim())
    }
  }
  if (!imported.size) continue
  for (const comp of imported) {
    if (!/^[A-Z]/.test(comp)) continue
    for (const tag of src.matchAll(new RegExp(`<${comp}\\b([^>]*?)/?>`, "gs"))) {
      for (const cm of tag[1].matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{([^}]*)\})/g)) {
        const value = cm[1] ?? cm[2] ?? cm[3] ?? ""
        if (new RegExp(`\\b${prefix}-`).test(value)) {
          const line = src.slice(0, tag.index).split("\n").length
          violations.push(`${relative(process.cwd(), file)}:${line}  <${comp} className="${value.trim().slice(0, 60)}">`)
        }
      }
    }
  }
}

const baselineFile = new URL("./consumer-baseline.json", import.meta.url)
let baseline = 0
try {
  baseline = JSON.parse(readFileSync(process.env.CONSUMER_BASELINE ?? baselineFile, "utf8"))[prefix] ?? 0
} catch {}

console.log(`kit components styled with ${prefix}-* classes: ${violations.length} (baseline ${baseline})`)
for (const v of violations) console.log(`  ${v}`)
if (violations.length > baseline) {
  console.error(`\nA kit component picked up a ${prefix}-* class. Give it a prop, or give this app its own component.`)
  process.exit(1)
}
