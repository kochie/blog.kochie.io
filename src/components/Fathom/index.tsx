'use client'
import { load, trackPageview } from 'fathom-client'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Fathom() {
  const { events } = useRouter()
  useEffect(() => {
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
    function onRouteChangeComplete(): void {
      trackPageview()
    }
    // Record a pageview when route changes
    events.on('routeChangeComplete', onRouteChangeComplete)
    // Unassign event listener
    return (): void => {
      events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [events])

  return null
}
