import React, { ReactNode } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'

import '../styles/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
import { Lato } from '@next/font/google'

import {
  Fathom,
  Footer,
  ThemeButton,
  ThemeProvider,
  Topbar,
} from '@/components/index'

const lato = Lato({
  display: 'swap',
  weight: ['100', '300', '400', '700', '900'],
})

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className={lato.className}>
        <Fathom />
        <ThemeProvider>
          <ThemeButton />
          <Page>{children}</Page>
        </ThemeProvider>
      </body>
    </html>
  )
}

const Page = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Topbar />
      <div className="flex-grow">{children}</div>
      <Footer
        title={'Kochie Engineering'}
        links={[
          { name: 'me', src: 'https://me.kochie.io', goal: 'SEQGQC1X' },
          {
            name: 'linkedin',
            src: 'https://linkedin.com/in/rkkochie',
            goal: 'RMXXVNIC',
          },
          {
            name: 'rss',
            src: `https://${
              process.env.NEXT_PUBLIC_PROD_URL ||
              process.env.NEXT_PUBLIC_VERCEL_URL
            }/feed/rss.xml`,
            goal: 'PZQY507K',
          },
        ]}
      />
    </div>
  )
}
