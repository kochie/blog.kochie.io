import { access, readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { load, JSON_SCHEMA } from 'js-yaml'
import type { ArticleMetadata } from './article-path'

export type ProjectStatus = 'ongoing' | 'completed' | 'paused'

export interface ProjectManifest {
  /** Derived from the manifest filename (e.g. `foundry` from `foundry.yaml`). */
  slug: string
  title: string
  blurb: string
  hero: { src: string; alt: string; lqip?: string }
  status: ProjectStatus
  /** ISO-8601 date string. */
  startedDate: string
  /**
   * Optional ordering override. When present, articles whose `articleDir`
   * appears here take the positions implied by the list. Members not listed
   * are appended in `publishedDate` ascending order after the listed ones.
   */
  order?: string[]
}

export interface ProjectMember {
  article: ArticleMetadata
  chapter: number
}

export interface Project extends ProjectManifest {
  /** Members ordered ascending by computed chapter number. */
  members: ProjectMember[]
}

export interface ProjectContext {
  project: Project
  chapter: number
  prev: ProjectMember | null
  next: ProjectMember | null
}

const VALID_STATUSES: ReadonlySet<ProjectStatus> = new Set([
  'ongoing',
  'completed',
  'paused',
])

export const isProjectStatus = (v: unknown): v is ProjectStatus =>
  typeof v === 'string' && VALID_STATUSES.has(v as ProjectStatus)

const PROJECTS_DIR = './projects'

export async function getProjectManifest(
  slug: string
): Promise<ProjectManifest> {
  const path = join(process.cwd(), PROJECTS_DIR, `${slug}.yaml`)
  let raw: string
  try {
    raw = await readFile(path, 'utf-8')
  } catch (err) {
    throw new Error(
      `Project manifest not found for slug "${slug}" at ${path}: ${(err as Error).message}`
    )
  }
  const parsed = load(raw, { schema: JSON_SCHEMA }) as Record<
    string,
    unknown
  > | null
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Project manifest "${slug}" is empty or not an object`)
  }

  const status = parsed.status
  if (!isProjectStatus(status)) {
    throw new Error(
      `Project "${slug}" has invalid status "${String(status)}" — must be one of ongoing | completed | paused`
    )
  }

  const startedDate =
    parsed.startedDate instanceof Date
      ? parsed.startedDate.toISOString()
      : typeof parsed.startedDate === 'string'
        ? parsed.startedDate
        : undefined
  if (!startedDate) {
    throw new Error(`Project "${slug}" is missing a valid startedDate`)
  }

  const hero = parsed.hero as
    | { src?: string; alt?: string; lqip?: string }
    | undefined
  if (!hero || typeof hero.src !== 'string' || typeof hero.alt !== 'string') {
    throw new Error(`Project "${slug}" is missing hero.src or hero.alt`)
  }

  const rawOrder = Array.isArray(parsed.order)
    ? (parsed.order as unknown[]).filter(
        (v): v is string => typeof v === 'string' && v.length > 0
      )
    : undefined
  const order = rawOrder && rawOrder.length > 0 ? rawOrder : undefined

  if (typeof parsed.title !== 'string' || !parsed.title.trim()) {
    throw new Error(`Project "${slug}" is missing a required title field`)
  }
  if (typeof parsed.blurb !== 'string' || !parsed.blurb.trim()) {
    throw new Error(`Project "${slug}" is missing a required blurb field`)
  }

  return {
    slug,
    title: parsed.title,
    blurb: parsed.blurb,
    hero: { src: hero.src, alt: hero.alt, lqip: hero.lqip },
    status,
    startedDate,
    order,
  }
}

export async function buildProject(
  slug: string,
  allArticles: ReadonlyArray<ArticleMetadata>
): Promise<Project> {
  const manifest = await getProjectManifest(slug)

  // Membership = articles whose frontmatter declares this project.
  const members = allArticles.filter((a) => a.project === slug)

  // Validate that order: only references actual project members.
  if (manifest.order) {
    const memberSlugs = new Set(members.map((m) => m.articleDir))
    for (const ref of manifest.order) {
      if (!memberSlugs.has(ref)) {
        throw new Error(
          `Project "${slug}" order: references "${ref}" which is not a member of the project`
        )
      }
    }
  }

  // Validate explicit chapter pins.
  const pins = new Map<number, ArticleMetadata>()
  for (const a of members) {
    if (a.chapter === undefined) continue
    if (!Number.isInteger(a.chapter) || a.chapter <= 0) {
      throw new Error(
        `Project "${slug}" article "${a.articleDir}" has chapter ${a.chapter} — must be a positive integer`
      )
    }
    if (a.chapter > members.length) {
      throw new Error(
        `Project "${slug}" article "${a.articleDir}" has chapter ${a.chapter} which exceeds the project's member count (${members.length})`
      )
    }
    if (pins.has(a.chapter)) {
      const other = pins.get(a.chapter)!
      throw new Error(
        `Project "${slug}" has duplicate chapter ${a.chapter}: "${other.articleDir}" and "${a.articleDir}"`
      )
    }
    pins.set(a.chapter, a)
  }

  // Order unpinned members: manifest order: first, then publishedDate asc.
  const unpinned = members.filter((a) => a.chapter === undefined)
  const orderIndex = manifest.order
    ? new Map(manifest.order.map((s, i) => [s, i]))
    : null
  unpinned.sort((a, b) => {
    if (orderIndex) {
      const ia = orderIndex.get(a.articleDir) ?? Number.POSITIVE_INFINITY
      const ib = orderIndex.get(b.articleDir) ?? Number.POSITIVE_INFINITY
      if (ia !== ib) return ia - ib
    }
    return (
      new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()
    )
  })

  // Assign chapter numbers — fill the gaps left by pins, preserving order.
  const claimed = new Set(pins.keys())
  const assigned = new Map<string, number>()
  for (const [chapter, a] of pins) assigned.set(a.articleDir, chapter)
  let cursor = 1
  for (const a of unpinned) {
    while (claimed.has(cursor)) cursor++
    assigned.set(a.articleDir, cursor)
    claimed.add(cursor)
    cursor++
  }

  const orderedMembers: ProjectMember[] = members
    .map((a) => ({ article: a, chapter: assigned.get(a.articleDir)! }))
    .sort((a, b) => a.chapter - b.chapter)

  return { ...manifest, members: orderedMembers }
}

export async function getProjectContext(
  article: ArticleMetadata,
  allArticles: ReadonlyArray<ArticleMetadata>
): Promise<ProjectContext | null> {
  if (!article.project) return null
  const project = await buildProject(article.project, allArticles)
  const idx = project.members.findIndex(
    (m) => m.article.articleDir === article.articleDir
  )
  if (idx < 0) {
    // Article declares the project but isn't a member — should not happen
    // with a correctly-built project. Surface as null rather than throwing
    // because the article page will already render its own chrome.
    return null
  }
  return {
    project,
    chapter: project.members[idx].chapter,
    prev: idx > 0 ? project.members[idx - 1] : null,
    next: idx < project.members.length - 1 ? project.members[idx + 1] : null,
  }
}

async function dirExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function getAllProjectManifests(): Promise<ProjectManifest[]> {
  const dir = join(process.cwd(), PROJECTS_DIR)
  if (!(await dirExists(dir))) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const slugs = entries
    .filter((d) => d.isFile() && d.name.endsWith('.yaml'))
    .map((d) => d.name.replace(/\.yaml$/, ''))
  return Promise.all(slugs.map((slug) => getProjectManifest(slug)))
}
