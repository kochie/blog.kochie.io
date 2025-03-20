'use client'

import React, { ReactElement } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'

import style from './Footer.module.css'
import { trackEvent } from 'fathom-client'

interface FooterProps {
  title: string
  links: {
    name: string
    src: string
  }[]
}

const Footer = ({ title, links }: FooterProps): ReactElement => {
  return (
    <div className="w-full bg-gray-500">
      <div className="flex flex-col justify-evenly md:content-evenly items-center px-4 text-white h-20 md:m-auto md:flex-row md:justify-between md:align-baseline lg:max-w-5xl">
        <p>
          {title}{' '}
          <FontAwesomeIcon icon={faCopyright} className={style.copyright} />{' '}
          {'2020'}
        </p>
        <div className="flex relative">
          {links.map((link, i: number) => {
            const classes = ['relative ml-4']
            i === 0 ? null : classes.push(style.divider)
            return (
              <div key={link.src} className={classes.join(' ')}>
                <a
                  className={style.heading}
                  href={link.src}
                  onClick={(): void => trackEvent(link.name)}
                >
                  {link.name}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Footer
