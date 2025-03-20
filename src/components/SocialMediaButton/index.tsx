'use client'

import React from 'react'
import { findIconDefinition, library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocialMedia } from 'types/metadata'
import { trackEvent } from 'fathom-client'
import Link from 'next/link'
import {
  faInstagram,
  faLinkedin,
  faTwitter,
  faMastodon,
  faBluesky,
} from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faGlobe } from '@fortawesome/pro-light-svg-icons'

library.add(
  faTwitter,
  faLinkedin,
  faInstagram,
  faGlobe,
  faEnvelope,
  faMastodon,
  faBluesky
)

export default function SocialMediaButton({ sm }: { sm: SocialMedia }) {
  const icon = findIconDefinition({
    prefix: sm.icon[0],
    iconName: sm.icon[1],
  })
  return (
    <div>
      <Link
        href={sm.link}
        className="text-white transition ease-in-out duration-200"
        onClick={(): void => trackEvent(sm.name)}
        onMouseEnter={(event): void => {
          event.currentTarget.style.color = sm.color
          // event.currentTarget.style.transform = 'scale(1.2)'
        }}
        onMouseLeave={(event): void => {
          event.currentTarget.style.color = ''
          // event.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <FontAwesomeIcon
          icon={icon}
          size="1x"
          className="mx-1 transform-gpu transition duration-200 ease-in-out"
        />
      </Link>
    </div>
  )
}
