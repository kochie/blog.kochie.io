import { AppleLinks, Common } from '@/components/index'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'
import { NextSeo } from 'next-seo'

export default async function Head() {
  return (
    <>
      <title>Tags | Kochie Engineering</title>

      <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />

      {Common}
      {AppleLinks}
    </>
  )
}
