// Copies article images → public/images/articles/ and videos → public/videos/articles/ before build and dev.
// Run via prebuild / predev npm hooks.
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const ARTICLES_DIR = 'articles'
const IMAGES_DEST = 'public/images/articles'
const VIDEOS_DEST = 'public/videos/articles'

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg']
const VIDEO_EXTS = ['.mp4']

if (!existsSync(ARTICLES_DIR)) {
  console.log(`  No ${ARTICLES_DIR}/ directory — skipping article image copy`)
  process.exit(0)
}

const articleDirs = (await readdir(ARTICLES_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

let imageCount = 0
let videoCount = 0

for (const articleDir of articleDirs) {
  const files = await readdir(`${ARTICLES_DIR}/${articleDir}`)

  const imageFiles = files.filter((f) =>
    IMAGE_EXTS.some((ext) => f.endsWith(ext))
  )
  const videoFiles = files.filter((f) =>
    VIDEO_EXTS.some((ext) => f.endsWith(ext))
  )

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
