import React, { ReactElement } from 'react'
import Head from 'next/head'

interface HeadingProps {
  title: string
}

const Heading = ({ title }: HeadingProps): ReactElement => {
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content="I'm Rob, this is my blog about software and ECSE engineering, and other things I find interesting!"
      />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="icon"
        href="/images/icons/blog-logo-128.png"
        sizes="128x128"
        type="image/png"
      />
      <link
        rel="icon"
        href="/images/icons/blog-logo-192.png"
        sizes="192x192"
        type="image/png"
      />
      <link
        rel="icon"
        href="/images/icons/blog-logo-512.png"
        sizes="512x512"
        type="image/png"
      />
    </Head>
  )
}

export default Heading
