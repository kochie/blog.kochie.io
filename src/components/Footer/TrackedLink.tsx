'use client'

import { trackEvent } from 'fathom-client'
import Link from 'next/link'

export default function TrackedLink({
  href,
  name,
}: {
  href: string
  name: string
}) {
  return (
    <Link
      href={href}
      className="font-mono text-meta tracking-wide text-text-mute hover:text-accent transition-colors duration-fast"
      onClick={() => trackEvent(name)}
    >
      {name}
    </Link>
  )
}
