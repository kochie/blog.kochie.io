import visit from 'unist-util-visit'
// import { Node } from 'unist'
// @ts-expect-error: No imports defined
import is from 'hast-util-is-element'
import { join } from 'path'
import { lqip } from './shrink'

export default function (): (tree: any) => Promise<void> {
  return transformer

  async function transformer(tree: any): Promise<void> {
    // console.log('IS IT FIRING>>>>>>>.')
    const nodes: any[] = []
    visit(tree, 'element', (node) => {
      if (is(node, 'img')) {
        // console.log('HELLO', node)
        nodes.push(node)
      }
      // Do stuff with heading nodes
    })

    await Promise.all(
      nodes.map(async (node: any) => {
        // console.log(node)
        node.properties.lqip = lqip(
          join(process.env.PWD || '', 'public', node.properties.src)
        )
      })
    )

    // console.log(nodes)
  }
}
