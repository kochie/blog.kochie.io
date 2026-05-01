import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/pro-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import React, { type PropsWithChildren } from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

export type QuoteTier = 'prose' | 'wide' | 'bleed'

export interface QuoteProps {
  author?: string
  position?: string
  twitter?: string
  src?: string
  web?: string
  /** Width tier — defaults to `wide`. `bleed` uses the viewport-breakout
   *  pattern, escaping the content column to span up to `max-w-bleed`. */
  tier?: QuoteTier
}

// Bleed quotes need the same viewport-breakout pattern as bleed figures so
// they can escape the content column when the article body is in its
// 3-column grid layout. Prose/wide stay in flow.
const breakoutClass: Record<QuoteTier, string> = {
  prose: '',
  wide: '',
  bleed: 'xl:relative xl:left-1/2 xl:-translate-x-1/2 xl:w-screen',
}

const maxWidthClass: Record<QuoteTier, string> = {
  prose: 'max-w-prose',
  wide: 'max-w-wide',
  bleed: 'max-w-bleed',
}

/**
 * Pull-quote: serif italic, signal-yellow left stripe, optional attribution
 * line in mono. Spec §11.2 (kind="quote").
 */
export default function Quote({
  author,
  position,
  twitter,
  children,
  src,
  web,
  tier = 'wide',
}: PropsWithChildren<QuoteProps>) {
  const hasAttribution = author || position || src
  return (
    <div className={clsx('my-10', breakoutClass[tier])}>
      <div
        className={clsx(
          'mx-auto',
          maxWidthClass[tier],
          tier === 'bleed' && 'px-4 xl:px-0'
        )}
      >
        <div className="border-l-2 border-signal pl-6 py-2">
          <blockquote className="font-serif italic text-2xl leading-snug text-text">
            {children}
          </blockquote>
          {hasAttribution ? (
            <div className="mt-4 flex items-center gap-3 font-mono text-meta text-text-soft tracking-wide">
              {src ? (
                <Image
                  src={src}
                  alt={author ? `Photo of ${author}` : ''}
                  height={32}
                  width={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : null}
              <span>
                {author ? <span className="text-text">{author}</span> : null}
                {author && position ? <span> · </span> : null}
                {position ? <span>{position}</span> : null}
              </span>
              {twitter ? (
                <Link
                  href={twitter}
                  aria-label={`${author ?? 'Author'} on Twitter`}
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </Link>
              ) : null}
              {web ? (
                <Link href={web} aria-label={`${author ?? 'Author'} website`}>
                  <FontAwesomeIcon icon={faGlobe} />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
