import visit from 'unist-util-visit'
// @ts-expect-error no types
import isElement from 'hast-util-is-element'
import { join } from 'path'
import { lqip } from './shrink'
import type { Node } from 'unist'

function rehypeLqip(): (tree: Node) => Promise<void> {
  return transformer

  async function transformer(tree: Node): Promise<void> {
    const nodes: Node[] = []
    visit(tree, 'element', (node) => {
      if (isElement(node, 'img')) {
        nodes.push(node)
      }
    })

    await Promise.all(
      nodes.map(async (node: Node) => {
        // @ts-expect-error properties not defined
        if (node?.properties?.src) {
          // @ts-expect-error properties not defined
          node.properties.lqip = await lqip(
            join(
              process.env.PWD || '',
              'public',
              // @ts-expect-error properties not defined
              node.properties.src.toString()
            )
          )
        }
      })
    )
  }
}

export default rehypeLqip
