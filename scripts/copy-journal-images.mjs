// Copies journal/images/ → public/images/journal/ before build and dev.
// Run via prebuild / predev npm hooks.
import { cp, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const src = 'journal/images'
const dest = 'public/images/journal'

if (existsSync(src)) {
  await mkdir(dest, { recursive: true })
  await cp(src, dest, { recursive: true, force: true })
  console.log(`✓ Copied ${src}/ → ${dest}/`)
} else {
  console.log(`  No ${src}/ directory — skipping image copy`)
}
