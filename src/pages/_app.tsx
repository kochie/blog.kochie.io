import React, { ReactElement, useEffect } from 'react'
import { AppProps } from 'next/app'
import { Router } from 'next/router'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
import { DefaultSeo } from 'next-seo'
import { faComment, faCopyright, fad } from '@fortawesome/pro-duotone-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { MDXProvider } from '@mdx-js/react'
import { CodeBlock } from 'src/components/CodeBlocks'

import '../styles/main.css'

// import your default seo configuration
import SEO from '../lib/next-seo.config'
import Theme from 'src/components/Theme'
import { ThemeProvider } from 'src/components/Theme/context'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
library.add(faCopyright, fab, fas, fad, faComment)
Router.events.on('routeChangeComplete', (url) => {
  fathom.trackPageview({ url })
})

const components = {
  code: CodeBlock,
}

function App({ Component, pageProps }: AppProps): ReactElement {
  // const [theme, setTheme] = useState(THEME.dark)
  // const toggleTheme = () => {}

  // const setGlobalTheme = setTheme
  // const themeState = {theme, setGlobalTheme}

  useEffect(() => {
    const tracker = window.document.createElement('script')
    const firstScript = window.document.getElementsByTagName('script')[0]
    tracker.defer = true
    tracker.setAttribute('site', 'QFZGKZMZ')
    tracker.setAttribute('spa', 'auto')
    tracker.src = 'https://kite.kochie.io/script.js'
    firstScript.parentNode?.insertBefore(tracker, firstScript)
  }, [])

  return (
    <>
      <DefaultSeo {...SEO} />
      <MDXProvider components={components}>
        <ThemeProvider>
          <Theme />
          <Component {...pageProps} />
        </ThemeProvider>
      </MDXProvider>
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
