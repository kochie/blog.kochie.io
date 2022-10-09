import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHyphen } from '@fortawesome/pro-regular-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'
// import Link from 'next/link'
import React, { PropsWithChildren } from 'react'

export interface QuoteProps {
  author: string
  position: string
  twitter?: string
  src?: string
}

export default function Quote({
  author,
  position,
  twitter,
  children,
  src,
}: PropsWithChildren<QuoteProps>) {
  return (
    <div className="p-5 font-light text-2xl">
      <FontAwesomeIcon icon="quote-left" className="" />
      <span className="italic">{children}</span>
      <div className="flex items-center">
        <FontAwesomeIcon icon="quote-right" className="" />
        <FontAwesomeIcon icon={faHyphen} className="mx-4" />
        <div className="flex items-center ml-2">
          <img src={src} className="h-16 w-16 rounded-full mr-3" />
          <div className="text-base">
            <span>{author}</span>
            {twitter ? (
              <a href={twitter} className="ml-2">
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="hover:text-blue-500 transform-gpu duration-300"
                />
              </a>
            ) : null}
            <br />
            <span>{position}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
