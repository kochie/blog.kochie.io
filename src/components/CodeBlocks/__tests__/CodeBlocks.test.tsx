import React, { Suspense } from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'

describe('CODEBLOCKS COMPONENT', () => {
  test('renders correctly', async () => {
    const CodeBlock = (await import('@/components/CodeBlocks/codeblock'))
      .default

    let tree: ReactTestRenderer

    await act(async () => {
      tree = create(
        <Suspense>
          <CodeBlock className={'language-typescript{10}'} />
        </Suspense>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })

  test('renders highlight', async () => {
    const CodeBlock = (await import('@/components/CodeBlocks/codeblock'))
      .default

    let tree: ReactTestRenderer

    await act(async () => {
      tree = create(
        <Suspense>
          <CodeBlock className={'language-typescript{10}'} />
        </Suspense>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })

  test('renders highlight range', async () => {
    const CodeBlock = (await import('@/components/CodeBlocks/codeblock'))
      .default

    let tree: ReactTestRenderer

    await act(async () => {
      tree = create(
        <Suspense>
          <CodeBlock className={'language-typescript{10-15}'} />
        </Suspense>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })

  test('renders line numbers', async () => {
    const CodeBlock = (await import('@/components/CodeBlocks/codeblock'))
      .default

    let tree: ReactTestRenderer

    await act(async () => {
      tree = create(
        <Suspense>
          <CodeBlock className={'language-typescript{}[LineNumbers]'} />
        </Suspense>
      )
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
