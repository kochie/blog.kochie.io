#!/usr/bin/env node
/**
 * Pre-commit guard: every image referenced in a staged journal or article file
 * must itself be tracked by git (committed or staged).
 *
 * Exits 1 if any referenced image is untracked/missing.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')

/** Files that are staged (added/modified) in this commit. */
const stagedFiles = execSync('git diff --cached --name-only', { cwd: root })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

/** All files currently tracked by git (committed). */
const trackedFiles = new Set(
  execSync('git ls-files', { cwd: root })
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)
)

/** Staged files are also considered "safe" even if not yet in the committed tree. */
const stagedSet = new Set(stagedFiles)

function isCommittedOrStaged(repoRelativePath) {
  return trackedFiles.has(repoRelativePath) || stagedSet.has(repoRelativePath)
}

// Patterns that identify content files we want to check.
const CONTENT_PATTERNS = [
  /^journal\/.+\.(md|mdx)$/,
  /^articles\/.+\.(md|mdx)$/,
]

// Match any Markdown image syntax:  ![alt](./images/foo.jpg)  or  ![](images/bar.png)
const IMAGE_REF_RE = /!\[.*?\]\((\.[/\\]images[/\\][^)]+|images[/\\][^)]+)\)/g

let failed = false

for (const file of stagedFiles) {
  if (!CONTENT_PATTERNS.some((p) => p.test(file))) continue

  let content
  try {
    content = readFileSync(join(root, file), 'utf8')
  } catch {
    continue // file deleted in this commit — skip
  }

  const fileDir = dirname(file) // e.g. "journal" or "articles/12-iap-electron"

  for (const match of content.matchAll(IMAGE_REF_RE)) {
    const rawRef = match[1] // e.g. "./images/2026-06-04-photo-1.jpg"

    // Normalise: strip leading "./" so we can join cleanly.
    const normalised = rawRef.replace(/^\.\//, '') // "images/2026-06-04-photo-1.jpg"
    const repoRelative = join(fileDir, normalised)   // "journal/images/2026-06-04-photo-1.jpg"

    if (!isCommittedOrStaged(repoRelative)) {
      console.error(
        `✗ Missing image: ${repoRelative}\n  Referenced in: ${file}\n  Stage it with: git add ${repoRelative}`
      )
      failed = true
    }
  }
}

if (failed) {
  console.error('\nCommit blocked — stage all referenced images before committing.')
  process.exit(1)
} else {
  console.log('✓ All referenced images are tracked.')
}
