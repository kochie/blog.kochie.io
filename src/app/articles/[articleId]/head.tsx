import { AppleLinks, Common } from '@/components/index'
import { getArticleMetadata } from '@/lib/article-path'
import { NEXT_SEO_DEFAULT } from '@/lib/next-seo.config'
import { NextSeo } from 'next-seo'

export default async function Head({
  params,
}: {
  params: { articleId: string }
}) {
  const articleId = params.articleId
  const articleMetadata = await getArticleMetadata(articleId)
  const title = `${articleMetadata.title} | Kochie Engineering`
  return (
    <>
      <title>{title}</title>

      <NextSeo {...NEXT_SEO_DEFAULT} useAppDir={true} />

      {Common}
      {AppleLinks}
    </>
  )
}
