import Image from 'next/image'
import Link from 'next/link'
import {
  IframeHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  ReactNode,
} from 'react'
import { TOC } from '@/lib/rehype-toc-plugin'
import CodeBlock from '../CodeBlocks'
import GithubProject from '../GithubProject'
import Quote from '../Quote'
import HaloInteractive from '../Canvasses/ring-spinner'
// import type { StandardLonghandProperties } from 'csstype'

type PropsOnlyChildren = {
  children?: ReactNode
}

interface HeadingProps {
  id?: string
}

const PRE = ({ children }: PropsOnlyChildren) => {
  if (!children) return <pre />
  if (
    typeof children === 'string' ||
    typeof children === 'number' ||
    typeof children === 'boolean'
  ) {
    return <pre>{children}</pre>
  }

  // tried this a few times, but it doesn't work
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const className = children.props.className
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const grandChildren = children.props.children
  return <CodeBlock className={className}>{grandChildren}</CodeBlock>
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
  <h2 className="text-3xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
    {children}
  </h2>
)

const H3 = ({
  children,
  id,
}: PropsWithChildren<HeadingProps>): ReactElement => {
  return (
    <h3 className="text-2xl my-8" style={{ scrollMarginTop: '50px' }} id={id}>
      {children}
    </h3>
  )
}

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

  let image

  if (filename.endsWith('.svg')) {
    image = (
      <div className="relative rounded-t-xl overflow-hidden">
        <picture>
          <source srcSet={src} type="image/svg+xml" />
          <img
            src={src}
            alt={alt}
            width={parseInt(params.get('width') ?? '0')}
            height={parseInt(params.get('height') ?? '0')}
          />
        </picture>
      </div>
    )
  } else {
    image = (
      <div className="relative w-full h-auto rounded-t-xl overflow-hidden">
        <Image
          src={src || ''}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            // width: '100%',
            height: 'auto',
            // @ts-expect-error - objectFit is not a valid property
            objectFit: params.get('objectFit') ?? undefined,
          }}
          placeholder="blur"
          blurDataURL={lqip}
          height={parseInt(params.get('height') ?? '0')}
          width={parseInt(params.get('width') ?? '0')}
          alt={alt ?? ''}
        />
      </div>
    )
  }

  return (
    <div className={`mx-auto my-10 w-fit`}>
      {image}
      <div className="rounded-b-xl bg-gray-700 text-sm text-white">
        <div className="p-4">{alt}</div>
      </div>
    </div>
  )
}

const Iframe = (
  props: IframeHTMLAttributes<HTMLIFrameElement>
): ReactElement => (
  <div className="w-full my-10">
    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
    <iframe className="mx-auto" {...(props as any)} />
  </div>
)

const P = ({ children }: PropsOnlyChildren): ReactElement => {
  if (typeof children === 'string') {
    return <p className="my-3">{children}</p>
  }
  return <div className="my-3">{children}</div>
}

const BLOCKQUOTE = ({ children }: PropsOnlyChildren) => (
  <blockquote className="bg-white px-8 py-2 my-5 rounded-lg text-black">
    {children}
  </blockquote>
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
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  IMG,
  Iframe,
  P,
  BLOCKQUOTE,
  ANCHOR,
  CODE,
  OL,
  UL,
  LI,
  SUP,
  HR,
  PRE,
  GithubProject,
  Quote,
  HaloInteractive,
  TOC,
}
