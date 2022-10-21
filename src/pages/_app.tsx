import React, { ReactElement, useEffect } from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { DefaultSeo } from 'next-seo'
import {
  faComment,
  faCopyright,
  faArrowToTop,
  faLightbulbOn,
  faLightbulbSlash,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import {
  faTwitter,
  faGithub,
  faInstagram,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe, faEnvelope } from '@fortawesome/pro-light-svg-icons'
import * as Fathom from 'fathom-client'

import '../styles/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS

import SEO from '@/lib/next-seo.config'
import { ThemeProvider, ThemeButton } from '@/components/Theme'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
library.add(
  faCopyright,
  faComment,
  faTwitter,
  faGithub,
  faInstagram,
  faLinkedin,
  faGlobe,
  faEnvelope,
  faLightbulbOn,
  faLightbulbSlash,
  faCogs,
  faArrowToTop,
  faCircle
)

function App({ Component, pageProps }: AppProps): ReactElement {
  const { events } = useRouter()

  useEffect(() => {
    // Initialize Fathom when the app loads
    // Example: yourdomain.com
    //  - Do not include https://
    //  - This must be an exact match of your domain.
    //  - If you're using www. for your domain, make sure you include that here.
    Fathom.load('QFZGKZMZ', {
      includedDomains: ['blog.kochie.io'],
      url: 'https://kite.kochie.io/script.js',
      spa: 'auto',
    })

    function onRouteChangeComplete(): void {
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return (): void => {
      events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [events])

  return (
    <>
      <DefaultSeo {...SEO} />
      <ThemeProvider>
        <ThemeButton />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default App

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }
