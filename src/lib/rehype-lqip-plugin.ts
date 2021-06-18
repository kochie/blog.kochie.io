import { Node, visit } from 'unist-util-visit'
import { Element, isElement } from 'hast-util-is-element'
import { join } from 'path'
import { lqip } from './shrink'

export default function (): (tree: Node) => Promise<void> {
  return transformer

  async function transformer(tree: Node): Promise<void> {
    const nodes: Element[] = []
    visit(tree, 'element', (node) => {
      if (isElement(node, 'img')) {
        nodes.push(node)
      }
    })

    await Promise.all(
      nodes.map(async (node: Element) => {
        if (node?.properties?.src) {
          node.properties.lqip = await lqip(
            join(
              process.env.PWD || '',
              'public',
              node.properties.src.toString()
            )
          )
        }
      })
    )
  }
}
