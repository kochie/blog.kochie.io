import { visit } from 'unist-util-visit'
import { isElement } from 'hast-util-is-element'
import { join } from 'path'
import { lqip } from './shrink'
import type { Node } from 'unist'
import type { Element } from 'hast'

function rehypeLqip(articleDir: string): () => (tree: Node) => Promise<void> {
  return () => transformer

  async function transformer(tree: Node): Promise<void> {
    const nodes: Element[] = []
    visit(tree, 'element', (node: Element) => {
      if (isElement(node, 'img')) {
        nodes.push(node)
      }
    })

    await Promise.all(
      nodes.map(async (node) => {
        if (node?.properties?.src) {
          const filesrc = node.properties.src.toString().split('?')[0]
          node.properties.src = join(
            '/images/articles',
            articleDir,
            node.properties.src as string
          )
          node.properties.lqip = await lqip(
            join(
              process.env.PWD || '',
              'public/images/articles',
              articleDir,
              filesrc
            )
          )
        }
      })
    )
  }
}

export default rehypeLqip
