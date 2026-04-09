'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

const newMermaidRenderId = () =>
  `mermaid-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`

export interface MermaidDiagramProps {
  /** Raw Mermaid diagram source (fenced block body). */
  source: string
  className?: string
  /** Optional caption below the diagram (e.g. filename from fence meta). */
  caption?: string
}

/**
 * Renders Mermaid as an SVG figure — not a code block (no monospace shell,
 * no copy chrome). Use from MDX for ```mermaid fences.
 */
export default function MermaidDiagram({
  source,
  className,
  caption,
}: MermaidDiagramProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    let cancelled = false
    el.replaceChildren()
    setError(null)

    const run = async () => {
      try {
        const mermaid = (await import('mermaid')).default
        // Always use the light "default" theme: in site dark mode the chart sits on
        // a light pad below, and Mermaid's `dark` theme still emits dark title/axis
        // fills in the SVG margins (unreadable on a dark figure background).
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: { htmlLabels: true },
        })
        const { svg } = await mermaid.render(newMermaidRenderId(), source)
        if (!cancelled && hostRef.current === el) {
          const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
          const parsed = doc.querySelector('svg')
          if (parsed) {
            el.replaceChildren(document.importNode(parsed, true))
          } else {
            throw new Error('Mermaid returned invalid SVG')
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Failed to render Mermaid diagram'
          )
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [source])

  return (
    <figure
      className={clsx(
        'not-prose my-8 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60',
        className
      )}
    >
      {error ? (
        <pre
          className="m-0 overflow-x-auto p-4 text-sm leading-relaxed text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </pre>
      ) : (
        <div
          ref={hostRef}
          className={clsx(
            'flex min-h-[4rem] justify-center overflow-x-auto px-4 py-6 md:px-6 md:py-8',
            'rounded-lg',
            // Light canvas under the full SVG (including margin) so default-theme
            // title / axis labels stay dark-on-light in site dark mode.
            'dark:bg-zinc-100 dark:shadow-inner dark:shadow-black/10',
            '[&_svg]:mx-auto [&_svg]:max-h-none [&_svg]:max-w-full'
          )}
          role="img"
          aria-label="Diagram"
        />
      )}
      {caption ? (
        <figcaption className="border-t border-zinc-200 px-4 py-3 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
