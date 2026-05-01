import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'
import type { Element, Root } from 'hast'

vi.mock('../shrink', () => ({
  lqip: vi.fn(async () => 'data:image/png;base64,mocklqip'),
}))

const mockMetadata = vi.fn(async () => ({ width: 1600, height: 900 }))
vi.mock('sharp', () => ({
  default: () => ({ metadata: mockMetadata }),
}))

import rehypeLqip from '../rehype-lqip-plugin'
import { lqip } from '../shrink'

function img(src: string): Element {
  return {
    type: 'element',
    tagName: 'img',
    properties: { src },
    children: [],
  }
}

describe('rehypeLqip', () => {
  const pwd = '/fake/pwd'

  beforeEach(() => {
    vi.stubEnv('PWD', pwd)
    vi.mocked(lqip).mockClear()
    mockMetadata.mockReset()
    mockMetadata.mockResolvedValue({ width: 1600, height: 900 })
  })

  it('rewrites img src under article folder and strips query for lqip path', async () => {
    const articleDir = 'draft-1'
    const tree: Root = {
      type: 'root',
      children: [img('hero.png?width=600&height=400')],
    }

    const run = rehypeLqip(articleDir)()
    await run(tree as any)

    const el = tree.children[0] as Element
    expect(el.properties?.src).toBe(
      join('/images/articles', articleDir, 'hero.png?width=600&height=400')
    )
    expect(el.properties?.lqip).toBe('data:image/png;base64,mocklqip')
    expect(lqip).toHaveBeenCalledWith(
      join(pwd, 'public/images/articles', articleDir, 'hero.png')
    )
  })

  it('processes multiple images', async () => {
    const articleDir = 'x'
    const tree: Root = {
      type: 'root',
      children: [img('a.png'), img('b.jpg')],
    }

    await rehypeLqip(articleDir)()(tree as any)

    expect(lqip).toHaveBeenCalledTimes(2)
  })

  it('injects intrinsic width/height when none are provided', async () => {
    mockMetadata.mockResolvedValueOnce({ width: 2400, height: 1350 })
    const tree: Root = { type: 'root', children: [img('hero.png')] }

    await rehypeLqip('post')()(tree as any)

    const el = tree.children[0] as Element
    const src = el.properties!.src as string
    expect(src).toContain('width=2400')
    expect(src).toContain('height=1350')
  })

  it('preserves user-supplied width and height over intrinsic dimensions', async () => {
    mockMetadata.mockResolvedValueOnce({ width: 2400, height: 1350 })
    const tree: Root = {
      type: 'root',
      children: [img('hero.png?width=800&height=450')],
    }

    await rehypeLqip('post')()(tree as any)

    const el = tree.children[0] as Element
    const src = el.properties!.src as string
    expect(src).toContain('width=800')
    expect(src).toContain('height=450')
    expect(src).not.toContain('width=2400')
  })

  it('keeps other URL params alongside the injected dimensions', async () => {
    mockMetadata.mockResolvedValueOnce({ width: 1600, height: 900 })
    const tree: Root = {
      type: 'root',
      children: [img('hero.png?tier=bleed')],
    }

    await rehypeLqip('post')()(tree as any)

    const el = tree.children[0] as Element
    const src = el.properties!.src as string
    expect(src).toContain('tier=bleed')
    expect(src).toContain('width=1600')
    expect(src).toContain('height=900')
  })

  it('reads SVG dimensions via sharp when available', async () => {
    mockMetadata.mockResolvedValueOnce({ width: 315, height: 414 })
    const tree: Root = { type: 'root', children: [img('graph.svg')] }

    await rehypeLqip('post')()(tree as any)

    const el = tree.children[0] as Element
    const src = el.properties!.src as string
    expect(src).toContain('width=315')
    expect(src).toContain('height=414')
  })

  it('falls through silently when sharp cannot read an SVG', async () => {
    mockMetadata.mockRejectedValueOnce(new Error('unsupported svg'))
    const tree: Root = { type: 'root', children: [img('weird.svg')] }

    await expect(rehypeLqip('post')()(tree as any)).resolves.toBeUndefined()
    const el = tree.children[0] as Element
    const src = el.properties!.src as string
    expect(src).not.toContain('width=')
    expect(src).not.toContain('height=')
  })

  it('falls through silently when sharp metadata fails', async () => {
    mockMetadata.mockRejectedValueOnce(new Error('not an image'))
    const tree: Root = { type: 'root', children: [img('broken.png')] }

    await expect(rehypeLqip('post')()(tree as any)).resolves.toBeUndefined()
    const el = tree.children[0] as Element
    const src = el.properties!.src as string
    expect(src).not.toContain('width=')
    expect(src).not.toContain('height=')
  })
})
