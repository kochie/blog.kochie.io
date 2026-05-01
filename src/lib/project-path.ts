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
