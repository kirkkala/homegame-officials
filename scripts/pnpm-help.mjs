#!/usr/bin/env node
/**
 * Lists available npm scripts with their commands and descriptions.
 * Reads package.json scripts and scriptDescriptions, outputs a formatted
 * table. Run via: pnpm run help
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const dim = (s) => `\x1b[2m${s}\x1b[0m`
const cyan = (s) => `\x1b[36m${s}\x1b[0m`

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"))
const scripts = pkg.scripts || {}
const desc = pkg.scriptDescriptions || {}

console.log("\n" + cyan("Available scripts:") + "\n")
for (const [name, cmd] of Object.entries(scripts)) {
  const d = desc[name] || ""
  console.log(`  ${cyan(name)} ${dim(`(${cmd})`)}`)
  if (d) console.log(`    ${d}`)
}
