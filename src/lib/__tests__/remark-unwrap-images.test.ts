import { describe, it, expect } from 'vitest'
import type { Root, Paragraph, Image, Text } from 'mdast'
import remarkUnwrapImages from '../remark-unwrap-images'

const img = (url: string, alt = ''): Image => ({ type: 'image', url, alt })
const text = (value: string): Text => ({ type: 'text', value })
const paragraph = (...children: Paragraph['children']): Paragraph => ({
  type: 'paragraph',
  children,
})

const run = (tree: Root) => {
  remarkUnwrapImages()(tree as any)
}

describe('remarkUnwrapImages', () => {
  it('unwraps a paragraph that contains only an image', () => {
    const tree: Root = {
      type: 'root',
      children: [paragraph(img('/a.png', 'alpha'))],
    }
    run(tree)
    expect(tree.children).toHaveLength(1)
    expect(tree.children[0].type).toBe('image')
    expect((tree.children[0] as Image).url).toBe('/a.png')
  })

  it('preserves a paragraph that mixes images and text', () => {
    const tree: Root = {
      type: 'root',
      children: [paragraph(text('see '), img('/a.png'), text(' here'))],
    }
    run(tree)
    expect(tree.children).toHaveLength(1)
    expect(tree.children[0].type).toBe('paragraph')
  })

  it('unwraps multiple consecutive image-only paragraphs', () => {
    const tree: Root = {
      type: 'root',
      children: [
        paragraph(img('/a.png')),
        paragraph(text('between')),
        paragraph(img('/b.png')),
      ],
    }
    run(tree)
    expect(tree.children.map((n) => n.type)).toEqual([
      'image',
      'paragraph',
      'image',
    ])
  })

  it('unwraps a paragraph with multiple images side by side', () => {
    // Markdown like `![a](/a.png) ![b](/b.png)` on one line.
    const tree: Root = {
      type: 'root',
      children: [paragraph(img('/a.png'), img('/b.png'))],
    }
    run(tree)
    expect(tree.children).toHaveLength(2)
    expect(tree.children.map((n) => n.type)).toEqual(['image', 'image'])
  })
})
