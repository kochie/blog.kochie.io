import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import type { Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'
import rehypeVideoRename from '../rehype-video-rename'

function videoNode(src: string): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'Video',
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'src',
        value: src,
      },
    ],
    children: [],
  }
}

describe('rehypeVideoRename', () => {
  it('prefixes Video src with /videos/articles/{articleDir}', async () => {
    const articleDir = 'my-post'
    const tree: Root = {
      type: 'root',
      children: [videoNode('intro.webm')],
    }

    const runner = rehypeVideoRename(articleDir)()
    await runner(tree as any)

    const video = tree.children[0] as MdxJsxFlowElement
    const srcAttr = video.attributes.find((a) => a.name === 'src')
    expect(srcAttr && 'value' in srcAttr ? srcAttr.value : null).toBe(
      join('/videos/articles', articleDir, 'intro.webm')
    )
  })

  it('rewrites multiple Video nodes', async () => {
    const articleDir = 'abc'
    const tree: Root = {
      type: 'root',
      children: [videoNode('a.mp4'), videoNode('b.mp4')],
    }

    await rehypeVideoRename(articleDir)()(tree as any)

    const [v0, v1] = tree.children as MdxJsxFlowElement[]
    expect(
      v0.attributes.find((a) => a.name === 'src') &&
        'value' in (v0.attributes[0] as { value: string })
        ? (v0.attributes[0] as { value: string }).value
        : ''
    ).toContain('a.mp4')
    expect((v1.attributes[0] as { value: string }).value).toBe(
      join('/videos/articles', articleDir, 'b.mp4')
    )
  })
})
