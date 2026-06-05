/**
 * MDX component map for journal entries rendered in the feed.
 *
 * The article-default `img: IMG` wraps every image in a full-width `<Figure>`
 * designed for article layouts. Journal entries use a float-right layout
 * driven by Tailwind classes on the prose wrapper, so images are rendered as
 * plain `<img>` elements that the parent CSS can size and position freely.
 */
import React from 'react'
import { components } from './components'

function JournalIMG({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null
  // Strip query params added by the LQIP plugin (width=, height=, etc.) —
  // the plain img tag doesn't need them and they would appear in the URL.
  return <img src={src.split('?')[0]} alt={alt ?? ''} />
}

function JournalP({ children }: { children?: React.ReactNode }) {
  if (typeof children === 'string') {
    return <p className="my-3">{children}</p>
  }
  return <div className="my-3">{children}</div>
}

export const journalComponents = {
  ...components,
  img: JournalIMG,
  p: JournalP,
}
