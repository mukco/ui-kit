#!/usr/bin/env node
/**
 * The non-negotiables in CLAUDE.md, checked by something other than memory.
 *
 * The kit declares four rules — spacing from the scale, tokens not literals,
 * 44px targets, playground-or-it-didn't-happen — and an audit found it broke
 * all four in its own source. Rules enforced by whoever remembers to read the
 * file are not enforced.
 *
 * This is a ratchet, not a gate. There are hundreds of existing violations and
 * failing on all of them would block every change, so the current counts are
 * the baseline and the build fails when a number goes UP. New code has to be
 * clean; old code gets fixed when someone is already in there.
 *
 * Lower a baseline whenever you fix things — that is the point. Raising one is
 * a decision, and it should be visible in the diff.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, extname } from "node:path"

// Every rung of the scale, plus 0 and the 1px hairline cases.
const SCALE = new Set(["0", "1px", "2px", "0.125rem", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem"])
const SPACING = /^(margin|padding|gap|row-gap|column-gap)(-(top|right|bottom|left))?$/

const BASELINE = JSON.parse(readFileSync(new URL("./conventions-baseline.json", import.meta.url)))

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

const files = walk("src")
const findings = { colourLiteralsInComponents: [], offScaleSpacing: [] }

// Rule 1 of the README: a hex or rgb() literal inside a component is a bug.
for (const file of files.filter((f) => [".tsx", ".ts"].includes(extname(f)))) {
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return
    if (/#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/.test(line)) {
      findings.colourLiteralsInComponents.push(`${file}:${i + 1}`)
    }
  })
}

// Spacing that is neither a token nor a rung of the scale.
const css = readFileSync("src/ui.css", "utf8")
css.split("\n").forEach((line, i) => {
  const m = line.match(/^\s*([a-z-]+)\s*:\s*([^;]+);/)
  if (!m) return
  const [, prop, raw] = m
  if (!SPACING.test(prop)) return
  const value = raw.trim()
  if (value.includes("var(") || value.includes("env(") || value.includes("calc(")) return
  // The visually-hidden idiom, which is -1px by convention everywhere.
  if (value === "-1px") return
  for (const part of value.split(/\s+/)) {
    // `auto` is not a magnitude — it is "let the layout decide", and there is
    // no rung of a spacing scale that expresses it.
    if (part === "auto" || part === "inherit") continue
    // A negative margin is a deliberate pull-back, usually to cancel a
    // parent's padding. It is measured against that padding, not against the
    // scale, so snapping it would break the thing it exists to line up with.
    if (part.startsWith("-")) continue
    if (!SCALE.has(part)) {
      findings.offScaleSpacing.push(`ui.css:${i + 1}  ${prop}: ${value}`)
      break
    }
  }
})

let failed = false
for (const [rule, hits] of Object.entries(findings)) {
  const allowed = BASELINE[rule] ?? 0
  const status = hits.length > allowed ? "WORSE" : hits.length < allowed ? "better" : "same"
  console.log(`${rule}: ${hits.length} (baseline ${allowed}) — ${status}`)
  if (hits.length > allowed) {
    failed = true
    console.log(hits.slice(0, 15).map((h) => `    ${h}`).join("\n"))
    if (hits.length > 15) console.log(`    …and ${hits.length - 15} more`)
  }
  if (hits.length < allowed) {
    console.log(`    Lower the baseline to ${hits.length} — you fixed some.`)
  }
}

if (failed) {
  console.error("\nA convention got worse. Fix the new violations, or change the baseline on purpose.")
  process.exit(1)
}
