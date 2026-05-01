import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { getAllProjectManifests, getProjectManifest } from '../project-path'

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
