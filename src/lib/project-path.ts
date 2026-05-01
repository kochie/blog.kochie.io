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
