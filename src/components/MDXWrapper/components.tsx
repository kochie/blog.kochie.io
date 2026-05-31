import Image from 'next/image'
import Link from 'next/link'
import {
  IframeHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react'
import { TOC } from '@/lib/rehype-toc-plugin'
import CodeBlock from '@/components/CodeBlocks'
import Figure from '@/components/Figure'
import Equation from '@/components/Equation'
import Sidenote from '@/components/Sidenote'
import GithubProject from '@/components/GithubProject'
import Quote from '@/components/Quote'
import Canvas from '@/components/Canvas'
import React from 'react'

import {
  HaloInteractive,
  LinkedInEmbed,
  Spotify,
  Tweet,
  Video,
  YouTube,
} from './client_components'

// import type { StandardLonghandProperties } from 'csstype'

type PropsOnlyChildren = {
  children?: ReactNode
}

interface HeadingProps {
  id?: string
}

const PRE = ({ children, ...props }: PropsOnlyChildren) => {
  if (!children) return <pre />
  if (
    typeof children === 'string' ||
    typeof children === 'number' ||
    typeof children === 'boolean'
  ) {
    return <pre>{children}</pre>
  }

  // MDX wraps the parsed code fence as <pre><code className="lang-…">…</code></pre>.
  // We grab the className (for syntax highlighting language detection) and
  // the inner string from the <code> child.
  // @ts-expect-error MDX passes opaque element props on children
  const className = children.props.className
  // @ts-expect-error MDX passes opaque element props on children
  const grandChildren = children.props.children
  return (
    <Figure kind="code" tier="wide">
      <CodeBlock className={className} {...props}>
        {grandChildren}
      </CodeBlock>
    </Figure>
  )
}

const H1 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h1
    className="mx-auto max-w-prose text-5xl my-8"
    style={{ scrollMarginTop: '96px' }}
    id={id}
  >
    {children}
  </h1>
)

const H2 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h2
    id={id}
    style={{ scrollMarginTop: '96px' }}
    className="group relative mx-auto max-w-prose font-serif font-semibold text-h2 text-text mt-12 mb-4"
  >
    {id ? (
      <a
        href={`#${id}`}
        aria-label="Anchor to this section"
        className="absolute -left-6 top-1/2 -translate-y-1/2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-fast no-underline font-mono text-base"
      >
        §
      </a>
    ) : null}
    {children}
  </h2>
)

const H3 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h3
    id={id}
    style={{ scrollMarginTop: '96px' }}
    className="group relative mx-auto max-w-prose font-serif font-semibold text-h3 text-text mt-8 mb-3"
  >
    {id ? (
      <a
        href={`#${id}`}
        aria-label="Anchor to this section"
        className="absolute -left-5 top-1/2 -translate-y-1/2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-fast no-underline font-mono text-sm"
      >
        §
      </a>
    ) : null}
    {children}
  </h3>
)

const H4 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h4
    className="mx-auto max-w-prose text-xl my-8"
    style={{ scrollMarginTop: '96px' }}
    id={id}
  >
    {children}
  </h4>
)

const H5 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h5
    className="mx-auto max-w-prose text-lg my-8"
    style={{ scrollMarginTop: '96px' }}
    id={id}
  >
    {children}
  </h5>
)

const H6 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h6
    className="mx-auto max-w-prose text-base my-8"
    style={{ scrollMarginTop: '96px' }}
    id={id}
  >
    {children}
  </h6>
)

// Whitelist what can come in via the URL `tier` param so an authoring typo
// can't widen its way into a runtime shrug. Anything unknown falls back to
// the default tier for inline images (`wide`).
const FIGURE_TIERS = ['prose', 'wide', 'bleed'] as const
type FigureTier = (typeof FIGURE_TIERS)[number]
const isFigureTier = (v: string | null): v is FigureTier =>
  v !== null && (FIGURE_TIERS as readonly string[]).includes(v)

const IMG = ({
  src,
  alt,
  lqip,
}: {
  src?: string
  alt?: string
  lqip?: string
  articleDir?: string
}): ReactElement => {
  const params = new URLSearchParams(src?.split('?')[1])
  const filename = src?.split('?')[0] ?? ''

  // `?tier=prose|wide|bleed` lets authors pick the figure column width from
  // the markdown image syntax, e.g. `![alt](/pic.png?tier=prose)`. Distinct
  // from `?width=` which sets the pixel dimension for next/image.
  const tierParam = params.get('tier')
  const tier: FigureTier = isFigureTier(tierParam) ? tierParam : 'wide'

  const isSvg = filename.endsWith('.svg')
  // next/image's optimizer strips frames from animated formats — a GIF
  // comes out the other side as a static first frame. Force-unoptimize so
  // the original animated bytes reach the browser intact.
  const isAnimated = /\.(gif|apng)$/i.test(filename)

  const imageNode = isSvg ? (
    <picture>
      <source srcSet={src} type="image/svg+xml" />
      <img
        src={src}
        alt={alt}
        width={parseInt(params.get('width') ?? '0')}
        height={parseInt(params.get('height') ?? '0')}
        // SVGs are diagrams — keep them at their intrinsic size and let the
        // shrink-wrapping frame size to match. Caps at the frame width so
        // they scale down on narrow viewports.
        className="block mx-auto max-w-full h-auto"
      />
    </picture>
  ) : (
    <Image
      src={src ?? ''}
      // Tier widths cap at 78rem (bleed). Below xl the figure can fill
      // the column up to viewport width, so 100vw is the safe upper bound.
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 78rem"
      style={{
        // Raster images fill the frame to the tier width. Sources narrower
        // than the tier get a small browser-side upscale rather than a
        // smaller frame — visual consistency at the tier boundary matters
        // more than avoiding 1.0–1.3× upscale softening.
        display: 'block',
        width: '100%',
        height: 'auto',
        // @ts-expect-error - objectFit is not a valid React.Image style key
        objectFit: params.get('objectFit') ?? undefined,
      }}
      placeholder="blur"
      blurDataURL={lqip}
      height={parseInt(params.get('height') ?? '0')}
      width={parseInt(params.get('width') ?? '0')}
      unoptimized={params.has('unoptimized') || isAnimated}
      alt={alt ?? ''}
    />
  )

  return (
    // SVGs use the default fit frame (shrink-wrap to intrinsic size).
    // Raster images use the fill frame so the figure spans the tier
    // width consistently regardless of source pixel dimensions.
    <Figure
      kind="image"
      tier={tier}
      caption={alt}
      frame={isSvg ? 'fit' : 'fill'}
    >
      <div className="bg-bg-deep">{imageNode}</div>
    </Figure>
  )
}

const Iframe = (
  props: IframeHTMLAttributes<HTMLIFrameElement>
): ReactElement => (
  <Figure kind="video" tier="wide">
    <div
      className="relative w-full bg-bg-deep"
      style={{ aspectRatio: '16 / 9' }}
    >
      <iframe
        {...props}
        className="absolute inset-0 w-full h-full"
        allow={
          props.allow ??
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        }
        allowFullScreen
      />
    </div>
  </Figure>
)

const P = ({ children }: PropsOnlyChildren): ReactElement => {
  if (typeof children === 'string') {
    return <p className="mx-auto max-w-prose my-3">{children}</p>
  }
  return <div className="mx-auto max-w-prose my-3">{children}</div>
}

const BLOCKQUOTE = ({ children }: PropsOnlyChildren) => (
  <div className="mx-auto max-w-prose my-8">
    <blockquote className="border-l-2 border-accent pl-6 py-2 font-serif italic text-xl leading-snug text-text-mute">
      {children}
    </blockquote>
  </div>
)

const ANCHOR = ({
  children,
  href,
  ...props
}: PropsWithChildren<{ href?: string }>) => (
  <Link
    href={href ?? ''}
    {...props}
    className="underline font-bold scroll-my-14 dark:text-yellow-400 dark:hover:text-yellow-600 text-purple-600 hover:text-purple-800 duration-200"
  >
    {children}
  </Link>
)

const CODE = ({ children }: PropsWithChildren<Record<never, never>>) => (
  <code className="dark:bg-gray-800 text-sm p-1 rounded font-mono bg-gray-400 dark:text-white">
    {children}
  </code>
)

const OL = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <ol
    id={id}
    className="mx-auto max-w-prose list-decimal list-outside pl-8 my-4"
  >
    {children}
  </ol>
)

const UL = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <ul id={id} className="mx-auto max-w-prose list-disc list-outside pl-8 my-4">
    {children}
  </ul>
)

const LI = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <li id={id} className="list-item">
    {children}
  </li>
)

const SUP = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <sup id={id} style={{ scrollMarginTop: '96px' }}>
    {children}
  </sup>
)

const HR = () => (
  <hr className="mx-auto max-w-prose my-12 border-t border-rule" />
)

export const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  img: IMG,
  p: P,
  ol: OL,
  ul: UL,
  li: LI,
  HaloInteractive,
  iframe: Iframe,
  Figure,
  Equation,
  Canvas,
  Sidenote,
  GithubProject,
  blockquote: BLOCKQUOTE,
  a: ANCHOR,
  code: CODE,
  TOC,
  sup: SUP,
  hr: HR,
  Quote,
  pre: PRE,
  Video,
  LinkedInEmbed,
  Tweet,
  YouTube,
  Spotify,
}
