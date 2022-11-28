import { AppleLinks, Common } from '@/components/index'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'
import { NextSeo } from 'next-seo'

export default async function Head() {
  return (
    <>
      <title>Authors | Kochie Engineering</title>

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width" />

      <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />

      {Common}
      {AppleLinks}
    </>
  )
}
