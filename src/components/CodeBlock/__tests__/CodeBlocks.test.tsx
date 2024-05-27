import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import CodeBlock from '@/components/CodeBlock/codeblock'

describe('CODEBLOCKS COMPONENT', () => {
  test('renders correctly', async () => {
    const { asFragment, container } = render(
      <CodeBlock className={'language-typescript{10}'} />
    )

    await waitFor(() => {
      expect(container.querySelector('pre')).toBeTruthy()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders highlight', async () => {
    const { asFragment, container } = render(
      <CodeBlock className={'language-typescript{10}'} />
    )

    await waitFor(() => {
      expect(container.querySelector('pre')).toBeTruthy()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders highlight range', async () => {
    const { asFragment, container } = render(
      <CodeBlock className={'language-typescript{10-15}'} />
    )

    await waitFor(() => {
      expect(container.querySelector('pre')).toBeTruthy()
    })
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders line numbers', async () => {
    const { asFragment, container } = render(
      <CodeBlock className={'language-typescript{}[LineNumbers]'} />
    )

    await waitFor(() => {
      expect(container.querySelector('pre')).toBeTruthy()
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
