'use client'
import { load, trackPageview } from 'fathom-client'
import { useEffect } from 'react'

// Broken until this is fixed.
// https://github.com/vercel/next.js/issues/42800

import { usePathname, useSearchParams } from 'next/navigation'

export default function Fathom() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  console.log(pathname, searchParams.toString())

  // Initialize Fathom when the app loads
  // Example: yourdomain.com
  //  - Do not include https://
  //  - This must be an exact match of your domain.
  //  - If you're using www. for your domain, make sure you include that here.
  load('QFZGKZMZ', {
    includedDomains: ['blog.kochie.io'],
    url: 'https://kite.kochie.io/script.js',
    spa: 'auto',
  })

  useEffect(() => {
    const url = new URL(pathname, 'https://blog.kochie.io')
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    trackPageview({
      url: url.toString(),
    })

    // Record a pageview when route changes
  }, [pathname, searchParams])

  return null
}
