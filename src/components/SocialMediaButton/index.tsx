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
    <Link
      href={sm.link}
      aria-label={sm.name}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-text-soft hover:text-accent transition-colors duration-fast"
      onClick={(): void => trackEvent(sm.name)}
    >
      <FontAwesomeIcon icon={icon} size="1x" />
    </Link>
  )
}
