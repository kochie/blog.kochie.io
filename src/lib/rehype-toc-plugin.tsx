import { Fragment, ReactElement } from 'react'
import type { Element, Text, Node } from 'hast'
import { heading } from 'hast-util-heading'
import { visit } from 'unist-util-visit'

import styles from '../styles/rehype-list.module.css'

function rehypeTOC(): (tree: Node) => Promise<void> {
  return transformer

  async function transformer(tree: Node): Promise<void> {
    const nodes: Element[] = []

    visit(tree, 'element', (node: Element) => {
      if (heading(node)) {
        nodes.push(node)
      }
    })

    const headings = nodes.map((h) => ({
      level: h.tagName,
      text: (h.children[0] as Text).value,
      id: h?.properties?.id,
    }))

    visit(
      tree,
      'mdxJsxFlowElement',
      (node: {
        name: string
        attributes: { type: string; name: string; value: string }[]
      }) => {
        if (node.name === 'TOC') {
          node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'a',
            value: JSON.stringify(headings),
          })
        }
      }
    )
  }
}

interface TreeElement {
  name: string
  id: string
  level: number
  parent?: TreeElement
  children: TreeElement[]
}

interface El {
  text: string
  id: string
  level: string
}

interface TOCProps {
  a: string
}

const TOC = ({ a }: TOCProps): ReactElement => {
  const makeTree = (list: El[]): TreeElement => {
    const tree: TreeElement = {
      name: 'ROOT',
      id: 'ROOT',
      level: 0,
      children: [],
    }

    let current = tree

    list.forEach((el) => {
      const level = parseInt(el.level[1])
      while (current.level >= level && current.parent) current = current.parent

      const node = {
        name: el.text,
        id: el.id,
        level: level,
        parent: current,
        children: [],
      }
      current.children.push(node)
      current = node
    })

    return tree
  }

  const tree = makeTree(JSON.parse(a))

  const parseTree = (tree: TreeElement[]) => {
    // if (tree.length === 0) return null
    return (
      <ol className={`list-inside ${styles.ol}`}>
        {tree.map((ch) => (
          <Fragment key={ch.id}>
            <li className={`${styles.li}`}>
              <a
                href={`#${ch.id}`}
                className="hover:underline font-medium ml-2"
              >
                {ch.name}
              </a>
            </li>
            {ch.children.length > 0 ? (
              <div className="ml-4">{parseTree(ch.children)}</div>
            ) : null}
          </Fragment>
        ))}
      </ol>
    )
  }

  return (
    <div>
      <div className="rounded-xl border-2 dark:border-white border-black p-10 my-6 dark:bg-gray-600 bg-gray-100 text-lg">
        <h1 className="text-3xl mb-3">Table of Contents</h1>
        {parseTree(tree.children)}
      </div>
    </div>
  )
}

export { rehypeTOC as default, TOC }
