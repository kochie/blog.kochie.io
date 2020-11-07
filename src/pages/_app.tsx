import React, { ReactElement, useEffect } from 'react'
import { AppProps } from 'next/app'
import { Router } from 'next/router'
// import ReactGA from 'react-ga'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
import { DefaultSeo } from 'next-seo'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'
import { MDXProvider } from '@mdx-js/react'
import Highlight, { defaultProps } from 'prism-react-renderer'
// import { useRouter } from 'next/router'

import '../styles/main.css'

// import your default seo configuration
import SEO from '../lib/next-seo.config'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
library.add(faCopyright)
Router.events.on('routeChangeComplete', (url) => {
  fathom.trackPageview({ url })
})

const pre = (props) => <div {...props} />
const CodeBlock = ({ children, className }) => {
  const language = className.replace(/language-/, '')
  return (
    <Highlight {...defaultProps} code={children} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, padding: '20px' }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

// const CodeBlock = (props) => <code {...props}/>

const components = {
  // pre,
  code: CodeBlock,
  // code: props => <pre><code {...props}/></pre>
}

function App({ Component, pageProps }: AppProps): ReactElement {
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
        <Component {...pageProps} />
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
