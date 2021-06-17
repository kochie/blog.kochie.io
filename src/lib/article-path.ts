import { readdir, access } from 'fs/promises'
import { read } from 'gray-matter'
import readingTime from 'reading-time'
import { join } from 'path'
import { lqip } from './shrink'

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function getArticles(): Promise<string[]> {
  if (!(await exists('./public/articles'))) return []
  const article_directories = (
    await readdir('./public/articles', { withFileTypes: true })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  return article_directories
}

export async function getAllArticlesMetadata(): Promise<ArticleMetadata[]> {
  const article_directories = await getArticles()
  const articles = article_directories.map((article_dir) =>
    getArticleMetadata(article_dir)
  )
  return await Promise.all(articles)
}

export async function getArticleMetadata(
  article_dir: string
): Promise<ArticleMetadata> {
  const file = read(`./public/articles/${article_dir}/index.mdx`)
  const publishedDate =
    file.data?.publishedDate?.toJSON() || new Date().toJSON()

  const dir = join(
    process.env.PWD || '',
    `/public/articles/${article_dir}/${file.data?.jumbotron?.src}`
  )
  // console.log(dir)

  return {
    title: file.data.title,
    blurb: file.data.blurb,
    author: file.data.author || '',
    path: (file as any).path,
    jumbotron: {
      ...file.data?.jumbotron,
      url: `/articles/${article_dir}/${file.data?.jumbotron?.src}`,
      lqip: await lqip(dir),
    },
    publishedDate,
    editedDate: file.data?.editedDate?.toJSON() || publishedDate,
    tags: file.data?.tags || [],
    readTime: readingTime(file.content).text,
    indexPath: `/articles/${article_dir}/index.mdx`,
    articleDir: article_dir,
  }
}

export interface ArticleMetadata {
  author: string
  path: string
  jumbotron: {
    url: string
    alt: string
    lqip: string
  }
  tags: string[]
  readTime: string
  indexPath: string
  articleDir: string
  publishedDate: string
  editedDate: string
  title: string
  blurb: string
}
