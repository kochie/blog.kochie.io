'use client'

import React, { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: 'h2' | 'h3'
}

interface TOCSidebarProps {
  /**
   * CSS selector for the article body that holds the rendered headings.
   * Defaults to `article`.
   */
  containerSelector?: string
}

const collectHeadings = (containerSelector: string): Heading[] => {
  const root = document.querySelector(containerSelector)
  if (!root) return []
  const nodes = root.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]')
  return Array.from(nodes).map((node) => ({
    id: node.id,
    text: node.textContent ?? '',
    level: node.tagName.toLowerCase() as 'h2' | 'h3',
  }))
}

/**
 * Sticky sidebar TOC for article pages. Hidden below the `xl:` breakpoint —
 * smaller screens get the inline `<TOC />` MDX widget if the author wants
 * one. Builds its list from rendered heading ids in the article body, and
 * highlights the heading currently in view via IntersectionObserver.
 */
const TOCSidebar = ({
  containerSelector = 'article',
}: TOCSidebarProps): React.ReactElement => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setHeadings(collectHeadings(containerSelector))
  }, [containerSelector])

  useEffect(() => {
    if (headings.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top
          )
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '0% 0% -75% 0%', threshold: 0 }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return <></>

  return (
    <nav
      aria-label="Article table of contents"
      data-toc
      className="hidden xl:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 text-meta font-mono leading-loose"
    >
      <div className="text-text-soft mb-3 tracking-wide">{'// in this piece'}</div>
      <ol className="space-y-1 list-none">
        {headings.map((h) => {
          const active = h.id === activeId
          return (
            <li
              key={h.id}
              data-level={h.level}
              className={h.level === 'h3' ? 'pl-3' : ''}
            >
              <a
                href={`#${h.id}`}
                className={[
                  'block border-l-2 pl-3 py-0.5 transition-colors duration-fast',
                  active
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-mute hover:text-text',
                ].join(' ')}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default TOCSidebar
