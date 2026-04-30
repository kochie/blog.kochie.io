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
import HaloInteractive from '@/components/Canvasses/ring-spinner'
import React from 'react'

import { LinkedInEmbed, Tweet, Video } from './client_components'

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

  // tried this a few times, but it doesn't work
  // @ts-expect-error MDX passes opaque element props on children
  const className = children.props.className
  // @ts-expect-error MDX passes opaque element props on children
  const grandChildren = children.props.children
  return (
    <CodeBlock className={className} {...props}>
      {grandChildren}
    </CodeBlock>
  )
}

const H1 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h1 className="text-5xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
    {children}
  </h1>
)

const H2 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => (
  <h2
    id={id}
    style={{ scrollMarginTop: '50px' }}
    className="group relative font-serif font-semibold text-h2 text-text mt-12 mb-4"
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
    style={{ scrollMarginTop: '50px' }}
    className="group relative font-serif font-semibold text-h3 text-text mt-8 mb-3"
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
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h4 className="text-xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h4>
  )
}

const H5 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h5 className="text-lg my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h5>
  )
}

const H6 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h6 className="text-base my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h6>
  )
}

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

  const imageNode = filename.endsWith('.svg') ? (
    <picture>
      <source srcSet={src} type="image/svg+xml" />
      <img
        src={src}
        alt={alt}
        width={parseInt(params.get('width') ?? '0')}
        height={parseInt(params.get('height') ?? '0')}
      />
    </picture>
  ) : (
    <Image
      src={src ?? ''}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{
        height: 'auto',
        // @ts-expect-error - objectFit is not a valid React.Image style key
        objectFit: params.get('objectFit') ?? undefined,
      }}
      placeholder="blur"
      blurDataURL={lqip}
      height={parseInt(params.get('height') ?? '0')}
      width={parseInt(params.get('width') ?? '0')}
      unoptimized={params.has('unoptimized')}
      alt={alt ?? ''}
    />
  )

  return (
    <Figure kind="image" tier="wide" caption={alt}>
      <div className="bg-bg-deep">{imageNode}</div>
    </Figure>
  )
}

const Iframe = (
  props: IframeHTMLAttributes<HTMLIFrameElement>
): ReactElement => (
  <div className="w-full my-10">
    <iframe className="mx-auto" {...props} />
  </div>
)

const P = ({ children }: PropsOnlyChildren): ReactElement => {
  if (typeof children === 'string') {
    return <p className="my-3">{children}</p>
  }
  return <div className="my-3">{children}</div>
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
  <ol id={id} className="list-decimal list-outside px-12">
    {children}
  </ol>
)

const UL = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <ul id={id} className="list-inside">
    {children}
  </ul>
)

const LI = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <li id={id} className="list-item">
    {children}
  </li>
)

const SUP = ({ children, id }: PropsWithChildren<{ id?: string }>) => (
  <sup id={id} style={{ scrollMarginTop: '50px' }}>
    {children}
  </sup>
)

const HR = () => <hr className="my-6 border-2 mx-8" />

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
}
