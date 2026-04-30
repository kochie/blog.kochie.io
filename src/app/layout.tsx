import React, { ReactNode, Suspense } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'
import {
  Source_Serif_4 as SourceSerif4,
  Geist,
  Geist_Mono as GeistMono,
} from 'next/font/google'
import type { Metadata, Viewport } from 'next'

import '@/styles/main.css'
import '@fortawesome/fontawesome-svg-core/styles.css'

import { Fathom, Topbar } from '@/components'
import { Footer } from '@/components/Footer/twui-footer'
import { ThemeProvider } from '@/components/Theme'

config.autoAddCss = false

const sourceSerif = SourceSerif4({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

const geistMono = GeistMono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const description =
  'My blog about software engineering, programming, and technology. I write about stuff I see around the internet.'

export const viewport: Viewport = {
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A1815',
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://blog.kochie.io'),
    title: {
      default: 'Kochie Engineering',
      template: '%s | Kochie Engineering',
    },
    description,
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': '/feed/rss',
      },
    },
    manifest: '/manifest.json',
    creator: 'Robert Koch',
    authors: [{ name: 'Robert Koch' }],
    openGraph: {
      type: 'website',
      locale: 'en-AU',
      url: '/',
      siteName: 'Kochie Engineering',
      title: 'Kochie Engineering',
      description,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@kochie',
      creatorId: '90334112',
      site: '@kochie',
      description,
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
  const fontVars = `${sourceSerif.variable} ${geistSans.variable} ${geistMono.variable}`
  return (
    <html
      lang="en"
      className={fontVars}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head />
      <body>
        <Suspense fallback={null}>
          <Fathom />
        </Suspense>
        <ThemeProvider>
          <Page>{children}</Page>
        </ThemeProvider>
      </body>
    </html>
  )
}

const Page = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden font-serif">
      <Topbar />
      <div className="flex-grow">{children}</div>
      <Footer title="Kochie Engineering" description={description} />
    </div>
  )
}
