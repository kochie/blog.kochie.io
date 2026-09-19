import type { PropsWithChildren, ReactElement } from 'react'

/**
 * MDXContent expects a `components` map, but the real one (src/components/MDXWrapper/components.tsx)
 * leans on next/image, next/link, and a pile of 'use client' widgets (Tweet, YouTube, Canvas, ...) that
 * can't render outside the Next.js app (this runs from a plain Node script at build time — see
 * bin/prebuild.ts). This map swaps those out for dependency-free equivalents so the feed's `content`
 * field gets real static HTML instead of throwing mid-build.
 */

const absoluteUrl = (src?: string): string | undefined => {
  if (!src) return src
  if (/^https?:\/\//.test(src)) return src
  return `https://blog.kochie.io${src.startsWith('/') ? '' : '/'}${src}`
}

/** Feed readers can't run embeds/canvases/interactive widgets — point back at the real article instead. */
const EmbedNotice = (articleUrl: string) => {
  function ViewOnBlogNotice(): ReactElement {
    return (
      <p
        style={{
          margin: '1.5em 0',
          padding: '0.75em 1em',
          border: '1px solid #ccc',
          borderRadius: 6,
        }}
      >
        <a href={articleUrl}>View this on the blog →</a>
      </p>
    )
  }
  return ViewOnBlogNotice
}

export function buildFeedComponents(articleUrl: string) {
  const Notice = EmbedNotice(articleUrl)

  return {
    img: ({ src, alt }: { src?: string; alt?: string }): ReactElement => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={absoluteUrl(src?.split('?')[0])} alt={alt ?? ''} />
    ),
    a: ({
      href,
      children,
    }: PropsWithChildren<{ href?: string }>): ReactElement => (
      <a href={absoluteUrl(href)}>{children}</a>
    ),
    // rehype-mdx-code-props attaches fence-meta booleans (lineNumbers, wrap, shrink, ...)
    // meant for the real CodeBlock component — drop everything but className/children
    // so they don't land on a plain DOM element as invalid attributes.
    code: ({
      className,
      children,
    }: PropsWithChildren<{ className?: string }>): ReactElement => (
      <code className={className}>{children}</code>
    ),
    pre: ({ children }: PropsWithChildren<unknown>): ReactElement => (
      <pre>{children}</pre>
    ),
    iframe: Notice,
    Figure: ({
      children,
      caption,
    }: PropsWithChildren<{ caption?: string }>): ReactElement => (
      <figure>
        {children}
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    ),
    Equation: ({
      children,
      caption,
    }: PropsWithChildren<{ caption?: string }>): ReactElement => (
      <figure>
        <div>{children}</div>
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    ),
    Sidenote: ({ children }: PropsWithChildren<unknown>): ReactElement => (
      <aside>{children}</aside>
    ),
    Quote: ({
      children,
      author,
      position,
    }: PropsWithChildren<{
      author?: string
      position?: string
    }>): ReactElement => (
      <blockquote>
        {children}
        {author || position ? (
          <footer>{[author, position].filter(Boolean).join(', ')}</footer>
        ) : null}
      </blockquote>
    ),
    TOC: (): null => null,
    HaloInteractive: Notice,
    Canvas: Notice,
    GithubProject: Notice,
    TrainingQuadrantSquare: Notice,
    Place: Notice,
    Video: Notice,
    LinkedInEmbed: Notice,
    Tweet: Notice,
    YouTube: Notice,
    Spotify: Notice,
  }
}
