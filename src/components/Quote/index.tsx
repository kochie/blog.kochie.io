import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGlobe,
  faHyphen,
  faQuoteLeft,
  faQuoteRight,
} from '@fortawesome/pro-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
import React, { PropsWithChildren } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface QuoteProps {
  author?: string
  position?: string
  twitter?: string
  src?: string
  web?: string
}

export default function Quote({
  author,
  position,
  twitter,
  children,
  src,
  web,
}: PropsWithChildren<QuoteProps>) {
  return (
    <div className="p-5 my-10 font-light text-2xl">
      <FontAwesomeIcon icon={faQuoteLeft} className="" />
      <span className="italic">{children}</span>
      <div className="flex items-center">
        <FontAwesomeIcon icon={faQuoteRight} className="" />
        {(src || author || position) && (
          <FontAwesomeIcon icon={faHyphen} className="mx-4" />
        )}
        <div className="flex items-center ml-2">
          {src && (
            <Image
              src={src}
              alt={`Photo of ${author}`}
              height={64}
              width={64}
              className="h-16 w-16 rounded-full"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          )}
          <div className="text-base ml-3">
            <span>{author}</span>
            {twitter ? (
              <Link href={twitter} className="ml-2">
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="hover:text-blue-500 transform-gpu duration-300"
                />
              </Link>
            ) : null}
            {web ? (
              <Link href={web} className="ml-2">
                <FontAwesomeIcon
                  icon={faGlobe}
                  className="hover:text-red-500 transform-gpu duration-300"
                />
              </Link>
            ) : null}
            <br />
            <span>{position}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
