'use client'

import { ArticleMetadata } from '@/lib/article-path'
import { ArticleJsonLd } from 'next-seo'
import { Author } from 'types/metadata'

interface ArticleJsonProps {
  imageUrl: string
  author: Author
  url: string
  articleMetadata: ArticleMetadata
}
export const ArticleJsonLdBuilder = ({
  articleMetadata,
  url,
  author,
  imageUrl,
}: ArticleJsonProps) => (
  <ArticleJsonLd
    url={url}
    title={articleMetadata.title}
    images={[imageUrl]}
    datePublished={articleMetadata.publishedDate}
    dateModified={articleMetadata.editedDate}
    authorName={[
      {
        name: author.fullName,
        url: `https://${process.env.NEXT_PUBLIC_PROD_URL}/authors/${articleMetadata.author}`,
      },
    ]}
    publisherName={'Kochie Engineering'}
    publisherLogo={`https://${process.env.NEXT_PUBLIC_PROD_URL}/images/icons/blog-logo-128.png`}
    description={articleMetadata.blurb}
    isAccessibleForFree={true}
  />
)
