import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { copyFile, mkdir } from 'fs/promises'
import { join } from 'path'
import {
  buildProject,
  getAllProjectManifests,
  getProjectManifest,
} from '@/lib/project-path'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { lqip } from '@/lib/shrink'
import { ChapterTimeline } from '@/components'

const STATUS_PILL_COLOR: Record<string, string> = {
  ongoing: 'bg-accent/20 text-accent',
  completed: 'bg-text-soft/20 text-text-mute',
  paused: 'bg-signal/20 text-signal',
}

const formatDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })
    .toUpperCase()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const m = await getProjectManifest(slug)
    return {
      title: m.title,
      description: m.blurb,
      alternates: { canonical: `/projects/${slug}` },
      openGraph: {
        type: 'website',
        url: `/projects/${slug}`,
        title: `${m.title} | Kochie Engineering`,
        description: m.blurb,
        siteName: 'Kochie Engineering',
        images: [
          {
            url: `/images/projects/${slug}/${m.hero.src}`,
            alt: m.hero.alt,
          },
        ],
      },
    }
  } catch {
    return { title: 'Project' }
  }
}

export const generateStaticParams = async () => {
  const manifests = await getAllProjectManifests()
  return manifests.map((m) => ({ slug: m.slug }))
}

export default async function ProjectHub({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let project
  try {
    const articles = await getAllArticlesMetadata()
    project = await buildProject(slug, articles)
  } catch {
    notFound()
  }

  // Copy hero asset into public/ and produce LQIP, mirroring the article
  // jumbotron flow.
  const heroSrcOnDisk = join(
    process.cwd(),
    'projects',
    project.slug,
    project.hero.src
  )
  const heroPublicDir = join('public', 'images', 'projects', project.slug)
  await mkdir(heroPublicDir, { recursive: true })
  await copyFile(heroSrcOnDisk, join(heroPublicDir, project.hero.src))
  const heroLqip = await lqip(heroSrcOnDisk)
  const heroPublicPath = `/images/projects/${project.slug}/${project.hero.src}`

  const total = project.members.length
  const totalReadMins = project.members.reduce((sum, m) => {
    const match = m.article.readTime.match(/(\d+)/)
    return sum + (match ? parseInt(match[1], 10) : 0)
  }, 0)

  return (
    <main className="bg-bg text-text">
      <div className="mx-auto max-w-bleed px-4 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12">
        {/* Left column · hero, title, deck, meta */}
        <div>
          <div className="font-mono text-meta tracking-wide text-text-soft mb-4 flex items-baseline gap-2">
            <span>
              {'// '}
              <span className="text-accent">PROJECT</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded ${STATUS_PILL_COLOR[project.status]}`}
            >
              {project.status.toUpperCase()}
            </span>
          </div>
          <div className="relative w-full mb-6 rounded-md overflow-hidden border border-rule">
            <div style={{ aspectRatio: '16 / 10' }} className="relative w-full">
              <Image
                src={heroPublicPath}
                alt={project.hero.alt}
                fill
                placeholder="blur"
                blurDataURL={heroLqip}
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 1280px) 100vw, 800px"
              />
            </div>
          </div>
          <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
            {project.title}
          </h1>
          <p className="font-serif italic text-deck text-text-mute leading-snug mb-6">
            {project.blurb}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-meta tracking-wide text-text-soft pt-4 border-t border-rule">
            <span>STARTED {formatDate(project.startedDate)}</span>
            <span aria-hidden>·</span>
            <span>
              {total} {total === 1 ? 'CHAPTER' : 'CHAPTERS'}
            </span>
            {totalReadMins > 0 ? (
              <>
                <span aria-hidden>·</span>
                <span>~{totalReadMins} MIN TOTAL</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Right column · numbered chapter timeline */}
        <div>
          <div className="font-mono text-meta tracking-wide text-text-soft mb-6">
            {'// '}
            <span className="text-accent">CHAPTERS</span>
          </div>
          <ChapterTimeline members={project.members} />
        </div>
      </div>
    </main>
  )
}
