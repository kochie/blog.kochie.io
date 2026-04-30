/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import TOCSidebar from '../index'

if (typeof globalThis.IntersectionObserver === 'undefined') {
  // @ts-expect-error - test-only stub
  globalThis.IntersectionObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return []
    }
  }
}

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
})

const mountHeadings = (
  entries: { tag: 'h2' | 'h3'; id: string; text: string }[]
) => {
  const article = document.createElement('article')
  for (const entry of entries) {
    const node = document.createElement(entry.tag)
    node.id = entry.id
    node.textContent = entry.text
    article.appendChild(node)
  }
  document.body.appendChild(article)
  return article
}

describe('TOCSidebar', () => {
  it('renders nothing when there are no headings to extract', () => {
    const article = document.createElement('article')
    document.body.appendChild(article)
    const { container } = render(<TOCSidebar containerSelector="article" />)
    expect(container.querySelector('[data-toc] li')).toBeNull()
  })

  it('builds a list of links from h2 and h3 elements with ids', () => {
    mountHeadings([
      { tag: 'h2', id: 'why', text: 'Why it explodes' },
      { tag: 'h3', id: 'really', text: 'Really' },
      { tag: 'h2', id: 'fix', text: 'The fix' },
    ])
    const { container } = render(<TOCSidebar containerSelector="article" />)
    const links = container.querySelectorAll('a[href^="#"]')
    expect(links.length).toBe(3)
    expect(links[0].getAttribute('href')).toBe('#why')
    expect(links[1].getAttribute('href')).toBe('#really')
    expect(links[2].getAttribute('href')).toBe('#fix')
  })

  it('marks h3 entries with data-level for nested indent styling', () => {
    mountHeadings([
      { tag: 'h2', id: 'a', text: 'A' },
      { tag: 'h3', id: 'b', text: 'B' },
    ])
    const { container } = render(<TOCSidebar containerSelector="article" />)
    const items = container.querySelectorAll('[data-level]')
    expect(items[0].getAttribute('data-level')).toBe('h2')
    expect(items[1].getAttribute('data-level')).toBe('h3')
  })
})
