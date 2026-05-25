'use client'

import React, { useEffect, useRef, useState } from 'react'
import { computeAnchor, type BleedRect } from './bleed-jump'

interface Heading {
  id: string
  text: string
  level: 'h2' | 'h3' | 'h4'
}

interface TOCSidebarProps {
  /**
   * CSS selector for the article body that holds the rendered headings.
   * Defaults to `article`.
   */
  containerSelector?: string
  /**
   * CSS selector for bleed-tier elements that may collide with the TOC's
   * sticky position. Defaults to `[data-tier="bleed"]`.
   */
  bleedSelector?: string
}

const STICKY_TOP = 96 // matches `top-24` (6rem)
const GAP = 16

const collectHeadings = (containerSelector: string): Heading[] => {
  const root = document.querySelector(containerSelector)
  if (!root) return []
  const nodes = root.querySelectorAll<HTMLHeadingElement>(
    'h2[id], h3[id], h4[id]'
  )
  return Array.from(nodes).map((node) => {
    // The H2/H3 MDX components render a hover-to-share `§` anchor inside
    // every heading. Clone-and-strip it so its text doesn't bleed into
    // the TOC entry. Inline content links (rare but possible) are
    // preserved because they don't carry the anchor aria-label.
    const clone = node.cloneNode(true) as HTMLElement
    clone.querySelectorAll('a[aria-label^="Anchor"]').forEach((a) => a.remove())
    return {
      id: node.id,
      text: (clone.textContent ?? '').trim(),
      level: node.tagName.toLowerCase() as 'h2' | 'h3' | 'h4',
    }
  })
}

// Per-level left indent on the <li>. h2 sits flush; h3 nests one step;
// h4 nests two. Keeps the visual hierarchy honest without making h4
// entries unreadable in the narrow gutter.
const indentClass: Record<Heading['level'], string> = {
  h2: '',
  h3: 'pl-3',
  h4: 'pl-6',
}

/**
 * Read all bleed rects in document coordinates. Race-free: rects are read
 * before scrollY so a concurrent scroll can't corrupt the cached values.
 * Sorted by docTop ascending — required by the bleed-jump algorithm.
 */
const measureBleeds = (selector: string): BleedRect[] => {
  const els = Array.from(document.querySelectorAll(selector))
  const rects = els.map((el) => el.getBoundingClientRect())
  const sy = window.scrollY
  return rects
    .map((r) => ({ docTop: r.top + sy, docBottom: r.bottom + sy }))
    .sort((a, b) => a.docTop - b.docTop)
}

/**
 * Sticky sidebar TOC for article pages. Hidden below the `xl:` breakpoint —
 * smaller screens get the inline `<TOC />` MDX widget if the author wants
 * one. Builds its list from rendered heading ids in the article body, and
 * highlights the heading currently in view via IntersectionObserver.
 *
 * The TOC sits in the page gutter, which collides with bleed-tier figures.
 * The bleed-jump effect (see `bleed-jump.ts`) shifts the TOC above or below
 * any conflicting bleed via a GPU-composited transform on the inner nav,
 * leaving the outer wrapper's native sticky pinning untouched.
 */
const TOCSidebar = ({
  containerSelector = 'article',
  bleedSelector = '[data-tier="bleed"]',
}: TOCSidebarProps): React.ReactElement => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const navRef = useRef<HTMLElement | null>(null)

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

  // Bleed-jump effect — shift the nav out of the way of bleed sections.
  useEffect(() => {
    if (headings.length === 0) return
    const nav = navRef.current
    if (!nav) return

    let cachedTocH = nav.offsetHeight
    let cachedVh = window.innerHeight
    let cachedBleeds = measureBleeds(bleedSelector)

    const config = { stickyTop: STICKY_TOP, gap: GAP }

    const apply = () => {
      // Hidden below xl breakpoint — offsetHeight is 0, nothing to do.
      if (cachedTocH === 0) {
        nav.style.transform = ''
        return
      }
      // The bleed-jump math assumes the wrapper is sticky-pinned at
      // viewport y=stickyTop. Before the user has scrolled past the wrapper's
      // natural flow position (e.g. on initial load, when the wrapper still
      // sits at the top of the body grid below the hero), applying a non-zero
      // translateY would physically lift the nav out of its column and onto
      // whatever sits above — producing the "TOC overlays the hero" glitch.
      // Skip the algorithm until the wrapper is actually pinned.
      const outer = nav.parentElement
      if (outer) {
        const outerTop = outer.getBoundingClientRect().top
        if (outerTop > STICKY_TOP + 1) {
          nav.style.transform = ''
          return
        }
      }
      const { translateY } = computeAnchor(
        window.scrollY,
        cachedVh,
        cachedTocH,
        cachedBleeds,
        config
      )
      nav.style.transform = `translate3d(0, ${translateY}px, 0)`
    }

    const remeasure = () => {
      cachedTocH = nav.offsetHeight
      cachedVh = window.innerHeight
      cachedBleeds = measureBleeds(bleedSelector)
      apply()
    }

    apply()

    // Synchronous scroll handler — compute() is sub-millisecond with cached
    // layout, so the transform write lands in the same paint frame as the
    // scroll event. rAF batching introduces a one-frame lag where the TOC
    // visibly trails the prose.
    window.addEventListener('scroll', apply, { passive: true })
    window.addEventListener('resize', remeasure)

    // Catch font-load reflows, image decodes, and content mutations that
    // shift bleed positions or change the TOC's height.
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(remeasure)
      ro.observe(nav)
      ro.observe(document.body)
      document.querySelectorAll(bleedSelector).forEach((el) => ro?.observe(el))
    }

    return () => {
      window.removeEventListener('scroll', apply)
      window.removeEventListener('resize', remeasure)
      ro?.disconnect()
      nav.style.transform = ''
    }
  }, [headings, bleedSelector])

  if (headings.length === 0) return <></>

  return (
    <div
      data-toc-pin
      className="hidden xl:block sticky top-24 max-h-[calc(100vh-6rem)]"
    >
      <nav
        ref={navRef}
        aria-label="Article table of contents"
        data-toc
        className="overflow-y-auto pr-4 text-meta font-mono leading-loose bg-bg will-change-transform"
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        <div className="text-text-soft mb-3 tracking-wide">
          {'// in this piece'}
        </div>
        <ol className="space-y-1 list-none">
          {headings.map((h) => {
            const active = h.id === activeId
            return (
              <li
                key={h.id}
                data-level={h.level}
                className={indentClass[h.level]}
              >
                <a
                  href={`#${h.id}`}
                  className={[
                    'block border-l-2 pl-3 py-0.5 break-words transition-colors duration-fast',
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
    </div>
  )
}

export default TOCSidebar
