import { access, readdir } from 'fs/promises'
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
  if (!(await exists('./public/articles-1'))) return []
  const article_directories = (
    await readdir('./public/articles-1', { withFileTypes: true })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  return article_directories
}

export async function getAllArticlesMetadata(): Promise<ArticleMetadata[]> {
  const article_directories = await getArticles()
  const current_time = new Date()
  const articles = (
    await Promise.all(
      article_directories.map(
        async (article_dir) => await getArticleMetadata(article_dir)
      )
    )
  )
    .sort((a, b) => {
      const da = new Date(a.editedDate)
      const db = new Date(b.editedDate)

      if (da < db) return 1
      if (da > db) return -1
      return 0
    })
    .filter((article) => {
      console.log(new Date(article.publishedDate))
      return new Date(article.publishedDate) <= current_time
    })
  return articles
}

export async function getArticleMetadata(
  article_dir: string
): Promise<ArticleMetadata> {
  const file = read(`./public/articles-1/${article_dir}/index.mdx`)
  const publishedDate =
    file.data?.publishedDate?.toJSON() || new Date().toJSON()

  const dir = join(
    process.env.PWD || '',
    `/public/articles-1/${article_dir}/${file.data?.jumbotron?.src}`
  )
  // console.log(dir)

  return {
    title: file.data.title,
    blurb: file.data.blurb,
    author: file.data.author || '',
    path: (file as any).path,
    jumbotron: {
      ...file.data?.jumbotron,
      url: `/articles-1/${article_dir}/${file.data?.jumbotron?.src}`,
      lqip: await lqip(dir),
    },
    publishedDate: file.data?.publishedDate?.toJSON() || new Date().toJSON(),
    editedDate: file.data?.editedDate?.toJSON() || publishedDate,
    tags: file.data?.tags || [],
    readTime: readingTime(file.content).text,
    indexPath: `/articles-1/${article_dir}/index.mdx`,
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
