import { AppleLinks, Common } from '@/components/index'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'
import { NextSeo } from 'next-seo'

export default async function Head({ params }: { params: { tagId: string } }) {
  return (
    <>
      <title>{`${params.tagId.replace(/^\w/, (c) =>
        c.toUpperCase()
      )} | Kochie Engineering`}</title>

      <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />

      {Common}
      {AppleLinks}
    </>
  )
}
