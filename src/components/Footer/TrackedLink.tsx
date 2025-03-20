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
      className="text-sm leading-6 text-gray-300 hover:text-white"
      onClick={() => trackEvent(name)}
    >
      {name}
    </Link>
  )
}
