import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'
import type { Element, Root } from 'hast'

vi.mock('../shrink', () => ({
  lqip: vi.fn(async () => 'data:image/png;base64,mocklqip'),
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
})
