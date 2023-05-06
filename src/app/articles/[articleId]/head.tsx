import { AppleLinks, Common } from '@/components/index'
import { getArticleMetadata } from '@/lib/article-path'

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

      {Common}
      {AppleLinks}
    </>
  )
}
