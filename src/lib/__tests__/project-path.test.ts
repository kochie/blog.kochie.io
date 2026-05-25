import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import {
  buildProject,
  getAllProjectManifests,
  getProjectContext,
  getProjectManifest,
} from '../project-path'
import type { ArticleMetadata } from '../article-path'

const TMP_ROOT = join(process.cwd(), '.tmp-project-tests')

beforeEach(async () => {
  await mkdir(TMP_ROOT, { recursive: true })
  vi.spyOn(process, 'cwd').mockReturnValue(TMP_ROOT)
})

afterEach(async () => {
  vi.restoreAllMocks()
  await rm(TMP_ROOT, { recursive: true, force: true })
})

const writeManifest = async (slug: string, body: string) => {
  await mkdir(join(TMP_ROOT, 'projects'), { recursive: true })
  await writeFile(join(TMP_ROOT, 'projects', `${slug}.yaml`), body, 'utf-8')
}

describe('getProjectManifest', () => {
  it('reads a well-formed manifest and returns the typed shape', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: A backyard metal foundry.',
        'hero:',
        '  src: hero.jpg',
        '  alt: A glowing crucible',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const m = await getProjectManifest('foundry')
    expect(m.slug).toBe('foundry')
    expect(m.title).toBe('The Foundry')
    expect(m.status).toBe('ongoing')
    expect(m.hero.src).toBe('hero.jpg')
    expect(m.startedDate).toMatch(/^2025-04-01/)
  })

  it('throws when the manifest file does not exist', async () => {
    await expect(getProjectManifest('does-not-exist')).rejects.toThrow(
      /does-not-exist/
    )
  })

  it('throws when status is not ongoing | completed | paused', async () => {
    await writeManifest(
      'bad-status',
      [
        'title: Bad',
        'blurb: …',
        'hero: { src: x.jpg, alt: x }',
        'status: shipping',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await expect(getProjectManifest('bad-status')).rejects.toThrow(/status/)
  })

  it('parses an optional order: array of article slugs', async () => {
    await writeManifest(
      'with-order',
      [
        'title: Order',
        'blurb: …',
        'hero: { src: x.jpg, alt: x }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
        'order:',
        '  - 14-a',
        '  - 15-b',
      ].join('\n')
    )
    const m = await getProjectManifest('with-order')
    expect(m.order).toEqual(['14-a', '15-b'])
  })

  it('throws when title is missing', async () => {
    await writeManifest(
      'no-title',
      [
        'blurb: x',
        'hero: { src: x.jpg, alt: x }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await expect(getProjectManifest('no-title')).rejects.toThrow(/title/i)
  })

  it('throws when blurb is missing', async () => {
    await writeManifest(
      'no-blurb',
      [
        'title: x',
        'hero: { src: x.jpg, alt: x }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await expect(getProjectManifest('no-blurb')).rejects.toThrow(/blurb/i)
  })

  it('normalises empty order: to undefined', async () => {
    await writeManifest(
      'empty-order',
      [
        'title: x',
        'blurb: x',
        'hero: { src: x.jpg, alt: x }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
        'order: []',
      ].join('\n')
    )
    const m = await getProjectManifest('empty-order')
    expect(m.order).toBeUndefined()
  })
})

describe('getAllProjectManifests', () => {
  it('returns an empty array when the projects directory is missing', async () => {
    const out = await getAllProjectManifests()
    expect(out).toEqual([])
  })

  it('returns one manifest per yaml file in the projects directory', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await writeManifest(
      'haloscan',
      [
        'title: Haloscan',
        'blurb: y',
        'hero: { src: b.jpg, alt: b }',
        'status: completed',
        'startedDate: 2024-01-01T00:00:00+10:00',
      ].join('\n')
    )
    const out = await getAllProjectManifests()
    const slugs = out.map((m) => m.slug).sort()
    expect(slugs).toEqual(['foundry', 'haloscan'])
  })

  it('ignores non-yaml files in the projects directory', async () => {
    await writeManifest(
      'real',
      [
        'title: Real',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await writeFile(join(TMP_ROOT, 'projects', 'README.md'), '# notes', 'utf-8')
    const out = await getAllProjectManifests()
    expect(out.map((m) => m.slug)).toEqual(['real'])
  })
})

const makeArticle = (over: Partial<ArticleMetadata>): ArticleMetadata =>
  ({
    author: 'kochie',
    path: '',
    jumbotron: { url: '', alt: '', lqip: '' },
    tags: [],
    keywords: [],
    readTime: '3 min read',
    indexPath: '',
    articleDir: '',
    publishedDate: '2025-01-01T00:00:00.000Z',
    editedDate: '2025-01-01T00:00:00.000Z',
    title: '',
    blurb: '',
    ...over,
  }) as ArticleMetadata

describe('buildProject', () => {
  it('returns no members when no article declares the project', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({ articleDir: 'unrelated', project: undefined }),
    ])
    expect(project.members).toEqual([])
    expect(project.title).toBe('The Foundry')
  })

  it('numbers chapters by publishedDate ascending when no order or pins exist', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({
        articleDir: 'b',
        project: 'foundry',
        publishedDate: '2025-05-01T00:00:00.000Z',
      }),
      makeArticle({
        articleDir: 'a',
        project: 'foundry',
        publishedDate: '2025-04-01T00:00:00.000Z',
      }),
      makeArticle({
        articleDir: 'c',
        project: 'foundry',
        publishedDate: '2025-06-01T00:00:00.000Z',
      }),
    ])
    expect(project.members.map((m) => m.article.articleDir)).toEqual([
      'a',
      'b',
      'c',
    ])
    expect(project.members.map((m) => m.chapter)).toEqual([1, 2, 3])
  })

  it("honours the manifest's order: list when present", async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
        'order:',
        '  - c',
        '  - a',
        '  - b',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({ articleDir: 'a', project: 'foundry' }),
      makeArticle({ articleDir: 'b', project: 'foundry' }),
      makeArticle({ articleDir: 'c', project: 'foundry' }),
    ])
    expect(project.members.map((m) => m.article.articleDir)).toEqual([
      'c',
      'a',
      'b',
    ])
    expect(project.members.map((m) => m.chapter)).toEqual([1, 2, 3])
  })

  it('appends articles missing from order: in publishedDate ascending', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
        'order:',
        '  - b',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({
        articleDir: 'a',
        project: 'foundry',
        publishedDate: '2025-04-01',
      }),
      makeArticle({
        articleDir: 'b',
        project: 'foundry',
        publishedDate: '2025-05-01',
      }),
      makeArticle({
        articleDir: 'c',
        project: 'foundry',
        publishedDate: '2025-06-01',
      }),
    ])
    expect(project.members.map((m) => m.article.articleDir)).toEqual([
      'b', // listed first in order:
      'a', // unlisted, earliest publishedDate
      'c', // unlisted, later publishedDate
    ])
    expect(project.members.map((m) => m.chapter)).toEqual([1, 2, 3])
  })

  it('honours an explicit chapter: pin and fills the rest deterministically', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({
        articleDir: 'a',
        project: 'foundry',
        publishedDate: '2025-04-01',
      }),
      makeArticle({
        articleDir: 'b',
        project: 'foundry',
        chapter: 1,
        publishedDate: '2025-05-01',
      }),
      makeArticle({
        articleDir: 'c',
        project: 'foundry',
        publishedDate: '2025-06-01',
      }),
    ])
    // b is pinned to 1; a and c fill 2 and 3 in publishedDate order.
    const byDir = Object.fromEntries(
      project.members.map((m) => [m.article.articleDir, m.chapter])
    )
    expect(byDir).toEqual({ a: 2, b: 1, c: 3 })
    // members should be sorted ascending by chapter
    expect(project.members.map((m) => m.article.articleDir)).toEqual([
      'b',
      'a',
      'c',
    ])
  })

  it('throws when two articles pin the same chapter number', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await expect(
      buildProject('foundry', [
        makeArticle({ articleDir: 'a', project: 'foundry', chapter: 1 }),
        makeArticle({ articleDir: 'b', project: 'foundry', chapter: 1 }),
      ])
    ).rejects.toThrow(/duplicate chapter/i)
  })

  it('throws when an explicit chapter exceeds the member count (would create a gap)', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await expect(
      buildProject('foundry', [
        makeArticle({ articleDir: 'a', project: 'foundry', chapter: 5 }),
        makeArticle({ articleDir: 'b', project: 'foundry' }),
      ])
    ).rejects.toThrow(/exceeds.*member count/i)
  })

  it('throws when chapter is not a positive integer', async () => {
    // Note: getArticleMatter already rejects chapter values that aren't
    // positive integers — they're coerced to undefined at the parse boundary.
    // This test exercises buildProject's defensive validation directly,
    // bypassing the parser by handing it a synthetic article with chapter=0.
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    await expect(
      buildProject('foundry', [
        makeArticle({ articleDir: 'a', project: 'foundry', chapter: 0 }),
      ])
    ).rejects.toThrow(/positive integer/i)
  })

  it("throws when order: references an article slug that isn't a member", async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
        'order:',
        '  - missing',
      ].join('\n')
    )
    await expect(
      buildProject('foundry', [
        makeArticle({ articleDir: 'a', project: 'foundry' }),
      ])
    ).rejects.toThrow(/order.*missing/i)
  })

  it('does not include articles that declare a different project', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({ articleDir: 'a', project: 'foundry' }),
      makeArticle({ articleDir: 'b', project: 'haloscan' }),
    ])
    expect(project.members.map((m) => m.article.articleDir)).toEqual(['a'])
  })

  it('exercises the gap-jump cursor path with a mid-chapter pin', async () => {
    // Pin at chapter 2; unpinned A (Apr) and C (Jun). Algorithm should
    // assign A=1, then jump cursor over the claimed 2, then assign C=3.
    // This is the only test that exercises the inner `while` of the
    // cursor-fill loop crossing a claimed slot.
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      makeArticle({
        articleDir: 'a',
        project: 'foundry',
        publishedDate: '2025-04-01',
      }),
      makeArticle({
        articleDir: 'b',
        project: 'foundry',
        chapter: 2,
        publishedDate: '2025-05-01',
      }),
      makeArticle({
        articleDir: 'c',
        project: 'foundry',
        publishedDate: '2025-06-01',
      }),
    ])
    expect(
      Object.fromEntries(
        project.members.map((m) => [m.article.articleDir, m.chapter])
      )
    ).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('explicit chapter pin wins when an article is also listed in order:', async () => {
    // Authoring scenario: someone pinned `chapter: 2` on an article that
    // also appears at order:[0]. The pin wins; the order: entry for that
    // article is silently ignored. Documents the precedence rule.
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
        'order:',
        '  - x',
        '  - y',
      ].join('\n')
    )
    const project = await buildProject('foundry', [
      // x is in order:[0] AND has an explicit chapter: 2 pin.
      makeArticle({
        articleDir: 'x',
        project: 'foundry',
        chapter: 2,
        publishedDate: '2025-04-01',
      }),
      // y is in order:[1] (no pin).
      makeArticle({
        articleDir: 'y',
        project: 'foundry',
        publishedDate: '2025-05-01',
      }),
    ])
    expect(
      Object.fromEntries(
        project.members.map((m) => [m.article.articleDir, m.chapter])
      )
    ).toEqual({ x: 2, y: 1 })
  })
})

describe('getProjectContext', () => {
  it('returns null for an article that has no project', async () => {
    const ctx = await getProjectContext(
      makeArticle({ articleDir: 'a', project: undefined }),
      [makeArticle({ articleDir: 'a' })]
    )
    expect(ctx).toBeNull()
  })

  it('returns prev=null and next=null for a single-chapter project', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const article = makeArticle({ articleDir: 'a', project: 'foundry' })
    const ctx = await getProjectContext(article, [article])
    expect(ctx).not.toBeNull()
    expect(ctx!.chapter).toBe(1)
    expect(ctx!.prev).toBeNull()
    expect(ctx!.next).toBeNull()
  })

  it('returns the chapter number, prev, and next for a middle chapter', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const all = [
      makeArticle({
        articleDir: 'a',
        project: 'foundry',
        publishedDate: '2025-04-01',
      }),
      makeArticle({
        articleDir: 'b',
        project: 'foundry',
        publishedDate: '2025-05-01',
      }),
      makeArticle({
        articleDir: 'c',
        project: 'foundry',
        publishedDate: '2025-06-01',
      }),
    ]
    const ctx = await getProjectContext(all[1], all)
    expect(ctx!.chapter).toBe(2)
    expect(ctx!.prev?.article.articleDir).toBe('a')
    expect(ctx!.next?.article.articleDir).toBe('c')
  })

  it('returns prev=null on the first chapter and next=null on the last', async () => {
    await writeManifest(
      'foundry',
      [
        'title: The Foundry',
        'blurb: x',
        'hero: { src: a.jpg, alt: a }',
        'status: ongoing',
        'startedDate: 2025-04-01T00:00:00+10:00',
      ].join('\n')
    )
    const all = [
      makeArticle({
        articleDir: 'a',
        project: 'foundry',
        publishedDate: '2025-04-01',
      }),
      makeArticle({
        articleDir: 'b',
        project: 'foundry',
        publishedDate: '2025-05-01',
      }),
    ]
    const first = await getProjectContext(all[0], all)
    expect(first!.prev).toBeNull()
    expect(first!.next?.article.articleDir).toBe('b')

    const last = await getProjectContext(all[1], all)
    expect(last!.prev?.article.articleDir).toBe('a')
    expect(last!.next).toBeNull()
  })

  it('throws when the article references a project that does not exist', async () => {
    const article = makeArticle({ articleDir: 'a', project: 'ghost' })
    await expect(getProjectContext(article, [article])).rejects.toThrow(/ghost/)
  })
})
