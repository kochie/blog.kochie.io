import { AppleLinks, Common } from '@/components/index'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'
import { NextSeo } from 'next-seo'

export default async function Head() {
  return (
    <>
      <title>Kochie Engineering</title>
      <meta
        name="description"
        content="I'm Rob, this is my blog about software and ECSE engineering, and other things I find interesting!"
      />

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width" />

      <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />
      {Common}
      {AppleLinks}
    </>
  )
}
