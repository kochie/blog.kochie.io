import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { join } from 'node:path'

const ARTICLES_DIR = './articles'
const TEMPLATE_PATH = './bin/article-template.mdx'

// Far-future date — articles with publishedDate > now are filtered out by
// getAllArticlesMetadata, so this keeps new scaffolds in "draft" until you
// edit it to a real date.
const DRAFT_PUBLISHED_DATE = '9999-12-31T00:00:00+10:00'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/-+$/, '')
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function nextArticleNumber(): Promise<string> {
  const entries = await readdir(ARTICLES_DIR, { withFileTypes: true })
  const numbers = entries
    .filter((e) => e.isDirectory())
    .map((e) => /^(\d+)-/.exec(e.name)?.[1])
    .filter((n): n is string => Boolean(n))
    .map((n) => parseInt(n, 10))

  const next = numbers.length ? Math.max(...numbers) + 1 : 1
  return String(next).padStart(2, '0')
}

function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function main() {
  const rawTitle = process.argv.slice(2).join(' ').trim()
  if (!rawTitle) {
    console.error('Usage: npm run new:article -- "Your article title"')
    process.exit(1)
  }

  const title = titleCase(rawTitle)
  const slug = slugify(rawTitle)
  const number = await nextArticleNumber()
  const dirName = `${number}-${slug}`
  const articleDir = join(ARTICLES_DIR, dirName)

  if (await pathExists(articleDir)) {
    console.error(`Article directory already exists: ${articleDir}`)
    process.exit(1)
  }

  const template = await readFile(TEMPLATE_PATH, 'utf-8')
  const filled = template
    .replaceAll('__TITLE__', title)
    .replaceAll('__PUBLISHED_DATE__', DRAFT_PUBLISHED_DATE)
    .replaceAll('__FIRST_SECTION_HEADING__', 'First section')
    .replaceAll('__SECOND_SECTION_HEADING__', 'Second section')
    .replaceAll('__THIRD_SECTION_HEADING__', 'Third section')

  await mkdir(articleDir, { recursive: true })
  await writeFile(join(articleDir, 'index.mdx'), filled, 'utf-8')

  console.log(`Created ${articleDir}/index.mdx`)
  console.log(
    `Next: drop a jumbotron image in ${articleDir}/, fill the frontmatter, then change publishedDate to ship.`
  )
}

await main()
