import { visit, SKIP } from 'unist-util-visit'
import type { Node, Parent } from 'unist'

interface MdastNode extends Node {
  type: string
  children?: MdastNode[]
}

// Markdown serialises `![alt](url)` on its own line as a paragraph that
// contains only an image. The article layout's `<P>` mapper then constrains
// every child to `max-w-prose`, which prevents inline images from honouring
// `tier=wide|bleed`. This plugin replaces such single-image paragraphs with
// the image node itself, so the figure renders at block level and the tier
// max-width applies to the figure's own container.
const remarkUnwrapImages = () => (tree: Node) => {
  visit(tree, 'paragraph', (node: MdastNode, index, parent) => {
    if (!parent || index === undefined || !node.children) return
    const onlyImages = node.children.every((c) => c.type === 'image')
    if (!onlyImages) return
    const p = parent as Parent & { children: MdastNode[] }
    p.children.splice(index, 1, ...(node.children as MdastNode[]))
    return [SKIP, index + node.children.length]
  })
}

export default remarkUnwrapImages
