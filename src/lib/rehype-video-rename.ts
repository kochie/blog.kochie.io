import { visit } from 'unist-util-visit'
import { join } from 'path'
import type { Node } from 'unist'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

function rehypeVideoRename(
  articleDir: string
): () => (tree: Node) => Promise<void> {
  return () => transformer

  async function transformer(tree: Node): Promise<void> {
    const nodes: MdxJsxFlowElement[] = []
    visit(tree, 'mdxJsxFlowElement', (node: any) => {
      if (node.name === 'Video') {
        nodes.push(node)
      }
    })

    await Promise.all(
      nodes.map(async (node) => {
        for (const attr of node.attributes) {
          // @ts-expect-error name and value are always defined
          if (attr.name === 'src' && typeof attr.value === 'string') {
            attr.value = join(
              '/videos/articles',
              articleDir,
              attr.value as string
            )
          }
        }
      })
    )
  }
}

export default rehypeVideoRename
