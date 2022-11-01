// import { GetStaticPaths } from 'next'
// import { MDXProvider } from '@mdx-js/react'
// import { serialize } from 'next-mdx-remote/serialize'
// import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
// import { compile, run } from '@mdx-js/mdx'
// import { NextSeo } from 'next-seo'

// import rehypeKatex from 'rehype-katex'
// import rehypeSlug from 'rehype-slug'
// import remarkSlug from 'remark-slug'
// import remarkMath from 'remark-math'
// import remarkGFM from 'remark-gfm'

// import rehypeLqip from '@/lib/rehype-lqip-plugin'
// import rehypeTOC from '@/lib/rehype-toc-plugin'
import {
  // ArticleMetadata,
  getArticleMetadata,
  getArticles,
  // getArticles,
} from '@/lib/article-path'

import type {
  // Author,
  Metadata,
} from 'types/metadata'
import { Revue, Article, AuthorCardLeft, Title } from '@/components/index'
import metadata from '../../../../metadata.yaml'

import { lqip } from '@/lib/shrink'
import { join } from 'path'
import { copyFile, mkdir, readdir } from 'fs/promises'
import { GetStaticPaths } from 'next'
// import * as components from './components'

const ArticlePage = async ({ params }: { params: { articleId: string } }) => {
  const articleId = params.articleId
  const articleMetadata = await getArticleMetadata(articleId)

  const files = await readdir(`articles/${articleMetadata.articleDir}`)
  await mkdir(`public/images/articles/${articleMetadata.articleDir}`, {
    recursive: true,
  })
  for (const file of files) {
    if (
      file.endsWith('.png') ||
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg') ||
      file.endsWith('.gif') ||
      file.endsWith('.svg')
    ) {
      await copyFile(
        `articles/${articleMetadata.articleDir}/${file}`,
        `public/images/articles/${articleMetadata.articleDir}/${file}`
      )
    }
  }

  let author = (metadata as Metadata).authors?.[articleMetadata.author] || ''
  const lqipString = await lqip(
    join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
  )
  author = { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }

  const path = join(process.env.PWD ?? '', articleMetadata.path)
  console.log('PATH', path)

  // const compiled = await compile(path, {
  //   remarkPlugins: [remarkMath, remarkSlug, remarkGFM],
  //   rehypePlugins: [
  //     rehypeTOC,
  //     rehypeKatex,
  //     rehypeLqip(articleMetadata.articleDir),
  //     rehypeSlug,
  //   ],
  // })

  return (
    <>
      <Title title={`${articleMetadata.title} | Kochie Engineering`} />
      {/* <NextSeo
        title={`${articleMetadata.title} | Kochie Engineering`}
        description={articleMetadata.blurb}
        openGraph={{
          url: `https://${
            process.env.NEXT_PUBLIC_PROD_URL ||
            process.env.NEXT_PUBLIC_VERCEL_URL
          }/articles/${articleMetadata.articleDir}`,
          title: `${articleMetadata.title} | Kochie Engineering`,
          description: articleMetadata.blurb,
          article: {
            publishedTime: articleMetadata.publishedDate,
            modifiedTime: articleMetadata?.editedDate || '',
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
              url: `https://${
                process.env.NEXT_PUBLIC_PROD_URL ||
                process.env.NEXT_PUBLIC_VERCEL_URL
              }/images/opengraph/${articleMetadata.articleDir}.png`,
              alt: articleMetadata.jumbotron.alt,
            },
          ],
          site_name: 'Kochie Engineering',
        }}
        twitter={{
          handle: '@kochie',
          site: '@kochie',
          cardType: 'summary_large_image',
        }}
      /> */}
      <Article article={articleMetadata} author={author}>
        {/* <MDXProvider components={components}></MDXProvider> */}

        {/* <MDXRemote {...mdxSource} components={components} /> */}
      </Article>
      <AuthorCardLeft author={author} />
      <Revue />
    </>
  )
}

export default ArticlePage

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   const articleMetadata = await getArticleMetadata(params?.articleId as string)

//   const files = await readdir(`articles/${articleMetadata.articleDir}`)
//   await mkdir(`public/images/articles/${articleMetadata.articleDir}`, {
//     recursive: true,
//   })
//   for (const file of files) {
//     if (
//       file.endsWith('.png') ||
//       file.endsWith('.jpg') ||
//       file.endsWith('.jpeg') ||
//       file.endsWith('.gif') ||
//       file.endsWith('.svg')
//     ) {
//       await copyFile(
//         `articles/${articleMetadata.articleDir}/${file}`,
//         `public/images/articles/${articleMetadata.articleDir}/${file}`
//       )
//     }
//   }

//   let author = (metadata as Metadata).authors?.[articleMetadata.author] || ''
//   const lqipString = await lqip(
//     join(process.env.PWD || '', '/public/images/authors', author.avatar.src)
//   )
//   author = { ...author, avatar: { src: author.avatar.src, lqip: lqipString } }

//   const mdxSource = await serialize(read(articleMetadata.path).content, {
//     mdxOptions: {
//       remarkPlugins: [remarkMath, remarkSlug, remarkGFM],
//       rehypePlugins: [
//         rehypeTOC,
//         rehypeKatex,
//         rehypeLqip(articleMetadata.articleDir),
//         rehypeSlug,
//       ],
//     },
//     // target: ['esnext'],
//   })
//   return { props: { articleMetadata, author, source: mdxSource } }
// }

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await getArticles()
  const paths = articles.map((article) => ({
    params: { articleId: article },
  }))

  return {
    paths,
    fallback: false,
  }
}
