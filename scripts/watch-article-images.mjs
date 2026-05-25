// Copies article images/videos at startup, then watches for changes during `next dev`.
// Run in parallel with the dev server via the `dev` npm script.
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { watch } from 'node:fs'
import { extname, join, sep } from 'node:path'

const ARTICLES_DIR = 'articles'
const IMAGES_DEST = 'public/images/articles'
const VIDEOS_DEST = 'public/videos/articles'

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg'])
const VIDEO_EXTS = new Set(['.mp4'])

// ── Initial copy ─────────────────────────────────────────────────────────────

async function initialCopy() {
  if (!existsSync(ARTICLES_DIR)) {
    console.log(`  No ${ARTICLES_DIR}/ directory — skipping article image copy`)
    return
  }

  const articleDirs = (await readdir(ARTICLES_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  let imageCount = 0
  let videoCount = 0

  for (const articleDir of articleDirs) {
    const files = await readdir(`${ARTICLES_DIR}/${articleDir}`)

    const imageFiles = files.filter((f) => IMAGE_EXTS.has(extname(f)))
    const videoFiles = files.filter((f) => VIDEO_EXTS.has(extname(f)))

    if (imageFiles.length > 0) {
      await mkdir(`${IMAGES_DEST}/${articleDir}`, { recursive: true })
      for (const file of imageFiles) {
        await copyFile(
          `${ARTICLES_DIR}/${articleDir}/${file}`,
          `${IMAGES_DEST}/${articleDir}/${file}`
        )
        imageCount++
      }
    }

    if (videoFiles.length > 0) {
      await mkdir(`${VIDEOS_DEST}/${articleDir}`, { recursive: true })
      for (const file of videoFiles) {
        await copyFile(
          `${ARTICLES_DIR}/${articleDir}/${file}`,
          `${VIDEOS_DEST}/${articleDir}/${file}`
        )
        videoCount++
      }
    }
  }

  console.log(`✓ Copied ${imageCount} article images → ${IMAGES_DEST}/`)
  if (videoCount > 0) {
    console.log(`✓ Copied ${videoCount} article videos → ${VIDEOS_DEST}/`)
  }
}

// ── File watcher ─────────────────────────────────────────────────────────────

function startWatcher() {
  if (!existsSync(ARTICLES_DIR)) return

  watch(ARTICLES_DIR, { recursive: true }, async (event, filename) => {
    if (!filename) return

    // filename is relative to ARTICLES_DIR, e.g. "01-halo-physics/image.png"
    // Use sep so this works on Windows too.
    const parts = filename.split(sep)
    if (parts.length !== 2) return // skip index.mdx, nested dirs, etc.

    const [articleDir, file] = parts
    const ext = extname(file)

    let destBase = null
    if (IMAGE_EXTS.has(ext)) destBase = IMAGES_DEST
    else if (VIDEO_EXTS.has(ext)) destBase = VIDEOS_DEST
    else return // not an image or video — ignore

    const src = join(ARTICLES_DIR, articleDir, file)
    if (!existsSync(src)) return // file was deleted — nothing to copy

    const destDir = join(destBase, articleDir)
    const dest = join(destDir, file)

    try {
      await mkdir(destDir, { recursive: true })
      await copyFile(src, dest)
      console.log(`  [watch] ${event}: ${src} → ${dest}`)
    } catch (err) {
      console.error(`  [watch] failed to copy ${src}:`, err.message)
    }
  })

  console.log(`  Watching ${ARTICLES_DIR}/ for article image/video changes…`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

await initialCopy()
startWatcher()
