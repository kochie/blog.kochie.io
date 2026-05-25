import { writeFile, access } from 'fs/promises'
import { join } from 'path'
import { execSync } from 'child_process'

const today = new Date()
const slug = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')

const outPath = join(process.cwd(), 'journal', `${slug}.md`)

const stub = `---
date: ${slug}
tags: []
---

`

async function main() {
  try {
    await access(outPath)
    console.error(`⚠ Entry already exists: journal/${slug}.md`)
    process.exit(1)
  } catch {
    // File does not exist — proceed
  }

  await writeFile(outPath, stub, 'utf-8')
  console.log(`✓ Created journal/${slug}.md`)

  // Try to open in the default editor
  const editor = process.env.EDITOR ?? process.env.VISUAL ?? 'open'
  try {
    execSync(`${editor} "${outPath}"`, { stdio: 'inherit' })
  } catch {
    console.log(`Open it: ${outPath}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
