import React, { ReactElement, useEffect } from 'react'
import { AppProps } from 'next/app'
import Router from 'next/router'
// import ReactGA from 'react-ga'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
import { DefaultSeo } from 'next-seo'
// import { useRouter } from 'next/router'

import '../styles/main.css'

// import your default seo configuration
import SEO from '../lib/next-seo.config'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
Router.events.on('routeChangeComplete', (url) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  fathom.trackPageview({ url })
})

function App({ Component, pageProps }: AppProps): ReactElement {
  useEffect(() => {
    const tracker = window.document.createElement('script')
    const firstScript = window.document.getElementsByTagName('script')[0]
    tracker.defer = true
    tracker.setAttribute('site', 'QFZGKZMZ')
    tracker.setAttribute('spa', 'auto')
    tracker.src = 'https://cdn.usefathom.com/script.js'
    firstScript.parentNode?.insertBefore(tracker, firstScript)
  }, [])

  return (
    <>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
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
