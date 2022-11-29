import type { NextSeoProps } from 'next-seo'

export const NEXT_SEO_DEFAULT: NextSeoProps = {
  title: 'Kochie Engineering',
  description:
    'My blog about software engineering, programming, and technology. I write about stuff I see around the internet.',
  canonical: 'https://blog.kochie.io',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://blog.kochie.io',
    site_name: 'Kochie Engineering',
    title: 'Kochie Engineering',
    description:
      'My blog about software engineering, programming, and technology. I write about stuff I see around the internet.',
    images: [
      {
        url: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/images/og.jpg`,
      },
    ],
  },
  twitter: {
    handle: '@kochie',
    site: '@kochie',
    cardType: 'summary_large_image',
  },
  useAppDir: true,
}
