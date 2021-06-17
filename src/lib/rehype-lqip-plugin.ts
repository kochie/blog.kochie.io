import visit from 'unist-util-visit'
// @ts-expect-error: No imports defined
import is from 'hast-util-is-element'
import { join } from 'path'
import { lqip } from './shrink'

export default function (): (tree: any) => Promise<void> {
  return transformer

  async function transformer(tree: any): Promise<void> {
    const nodes: any[] = []
    visit(tree, 'element', (node) => {
      if (is(node, 'img')) {
        nodes.push(node)
      }
    })

    await Promise.all(
      nodes.map(async (node: any) => {
        node.properties.lqip = await lqip(
          join(process.env.PWD || '', 'public', node.properties.src)
        )
      })
    )
  }
}
