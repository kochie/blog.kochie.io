import React, { Suspense } from 'react'
import { render, waitFor, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import CodeBlock from '@/components/CodeBlocks/codeblock'

describe('CODEBLOCKS COMPONENT', () => {
  test('renders correctly', async () => {
    let asFragment: () => DocumentFragment

    await act(async () => {
      const result = render(
        <Suspense fallback={<div>loading...</div>}>
          <CodeBlock className={'language-typescript{10}'} />
        </Suspense>
      )
      asFragment = result.asFragment
    })

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  test('renders highlight', async () => {
    let asFragment: () => DocumentFragment

    await act(async () => {
      const result = render(
        <Suspense fallback={<div>loading...</div>}>
          <CodeBlock className={'language-typescript{10}'} />
        </Suspense>
      )
      asFragment = result.asFragment
    })

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  test('renders highlight range', async () => {
    let asFragment: () => DocumentFragment

    await act(async () => {
      const result = render(
        <Suspense fallback={<div>loading...</div>}>
          <CodeBlock className={'language-typescript{10-15}'} />
        </Suspense>
      )
      asFragment = result.asFragment
    })

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })

  test('renders line numbers', async () => {
    let asFragment: () => DocumentFragment

    await act(async () => {
      const result = render(
        <Suspense fallback={<div>loading...</div>}>
          <CodeBlock className={'language-typescript{}[LineNumbers]'} />
        </Suspense>
      )
      asFragment = result.asFragment
    })

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
