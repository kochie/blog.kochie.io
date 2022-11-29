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

  const imageUrl = new URL(
    `https://${
      process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
    }/api/og`
  )

  imageUrl.searchParams.set(
    'author',
    encodeURIComponent(articleMetadata.author)
  )
  imageUrl.searchParams.set(
    'imageUrl',
    encodeURIComponent(articleMetadata.jumbotron.url)
  )
  imageUrl.searchParams.set('title', encodeURIComponent(articleMetadata.title))

  const url = `https://${
    process.env.NEXT_PUBLIC_PROD_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
  }/articles/${articleMetadata.articleDir}`

  return (
    <>
      <title>{title}</title>

      <NextSeo
        {...NEXT_SEO_DEFAULT}
        title={title}
        description={articleMetadata.blurb}
        openGraph={{
          url,
          title,
          description: articleMetadata.blurb,
          type: 'article',
          article: {
            publishedTime: articleMetadata.publishedDate,
            modifiedTime: articleMetadata?.editedDate,
            tags: articleMetadata.tags,
            authors: [
              `https://${
                process.env.NEXT_PUBLIC_PROD_URL ||
                process.env.NEXT_PUBLIC_VERCEL_URL
              }/authors/${articleMetadata.author}`,
            ],
          },
          images: [
            {
              url: imageUrl.toString(),
              width: 1200,
              height: 630,
              alt: articleMetadata.jumbotron.alt,
            },
          ],
          site_name: 'Kochie Engineering',
        }}
      />
      {Common}
      {AppleLinks}
    </>
  )
}
