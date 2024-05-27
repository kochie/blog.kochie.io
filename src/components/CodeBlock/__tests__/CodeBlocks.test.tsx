import React, { Suspense } from 'react'
import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import CodeBlock from '@/components/CodeBlock/codeblock'

describe('CODEBLOCKS COMPONENT', () => {
  test('renders correctly', async () => {
    const { asFragment } = render(
      <Suspense>
        <CodeBlock className={'language-typescript{10}'} />
      </Suspense>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('renders highlight', async () => {
    const { asFragment } = render(
      <Suspense>
        <CodeBlock className={'language-typescript{10}'} />
      </Suspense>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('renders highlight range', async () => {
    const { asFragment } = render(
      <Suspense>
        <CodeBlock className={'language-typescript{10-15}'} />
      </Suspense>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('renders line numbers', async () => {
    const { asFragment } = render(
      <Suspense>
        <CodeBlock className={'language-typescript{}[LineNumbers]'} />
      </Suspense>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
