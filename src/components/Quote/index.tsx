import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe } from '@fortawesome/pro-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import React, { type PropsWithChildren } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface QuoteProps {
  author?: string
  position?: string
  twitter?: string
  src?: string
  web?: string
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
}: PropsWithChildren<QuoteProps>) {
  const hasAttribution = author || position || src
  return (
    <div className="mx-auto max-w-prose my-10">
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
  )
}
