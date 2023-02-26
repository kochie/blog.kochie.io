import React, { ReactNode } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'
import { Lato } from 'next/font/google'
import type { Metadata } from 'next'

import '@/styles/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS

import { Fathom, Footer, Topbar } from '@/components'
import { ThemeProvider, ThemeButton } from '@/components/Theme'

config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

const lato = Lato({
  display: 'swap',
  weight: ['100', '300', '400', '700', '900'],
})

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kochie Engineering',
    description:
      'My blog about software engineering, programming, and technology. I write about stuff I see around the internet.',
    alternates: {
      canonical: 'https://blog.kochie.io',
      types: {
        'application/rss+xml': 'https://blog.kochie.io/feed/rss',
      },
    },
    manifest: '/manifest.json',
    themeColor: '#1f2937',
    colorScheme: 'dark',
    creator: 'Robert Koch',
    authors: [{ name: 'Robert Koch' }],
    openGraph: {
      type: 'website',
      locale: 'en-AU',
      url: 'https://blog.kochie.io',
      siteName: 'Kochie Engineering',
      title: 'Kochie Engineering',
      description:
        'My blog about software engineering, programming, and technology. I write about stuff I see around the internet.',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@kochie',
      creatorId: '90334112',
      site: '@kochie',
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    icons: {
      icon: [
        {
          url: '/images/icons/blog-logo-128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          url: '/images/icons/blog-logo-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: '/images/icons/blog-logo-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      apple: [],
    },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
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
    <div
      className={`min-h-screen flex flex-col overflow-hidden ${lato.className}`}
    >
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
