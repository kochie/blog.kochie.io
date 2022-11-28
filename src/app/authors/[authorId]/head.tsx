import { AppleLinks, Common } from '@/components/index'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'
import { NextSeo } from 'next-seo'

export default async function Head({
  params,
}: {
  params: { authorId: string }
}) {
  return (
    <>
      <title>{`${params.authorId} | Kochie Engineering`}</title>

      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width" />

      <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />

      {Common}
      {AppleLinks}
    </>
  )
}
