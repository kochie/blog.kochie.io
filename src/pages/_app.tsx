import React, { ReactElement, useEffect } from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
import { DefaultSeo } from 'next-seo'
import { faComment, faCopyright, fad } from '@fortawesome/pro-duotone-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import * as Fathom from 'fathom-client'

import '../styles/main.css'
// import 'tailwindcss/tailwind.css'

// import your default seo configuration
import SEO from '../lib/next-seo.config'
import Theme from 'src/components/Theme'
import { ThemeProvider } from 'src/components/Theme/context'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
library.add(faCopyright, fab, fas, fad, faComment)


function App({ Component, pageProps }: AppProps): ReactElement {
  const router = useRouter()

  useEffect(() => {
    // Initialize Fathom when the app loads
    // Example: yourdomain.com
    //  - Do not include https://
    //  - This must be an exact match of your domain.
    //  - If you're using www. for your domain, make sure you include that here.
    Fathom.load('QFZGKZMZ', {
      includedDomains: ['blog.kochie.io'],
      url: "kite.kochie.io",
      spa: 'auto'
    })

    function onRouteChangeComplete() {  
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])


  return (
    <>
      <DefaultSeo {...SEO} />
      <ThemeProvider>
        <Theme />
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
