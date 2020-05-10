import React, { ReactElement } from 'react'
import App from 'next/app'
import Router from 'next/router'
// import ReactGA from 'react-ga'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
import { DefaultSeo } from 'next-seo'

import '../styles/main.css'

// import your default seo configuration
import SEO from '../lib/next-seo.config'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
Router.events.on('routeChangeComplete', (url) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  fathom('trackPageview')
})

export default class MyApp extends App {
  render(): ReactElement {
    const { Component, pageProps } = this.props
    return (
      <>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </>
    )
  }
}

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
