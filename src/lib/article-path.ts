import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'fs/promises'
// import { read } from 'gray-matter'
import pkg from 'gray-matter'
const { read } = pkg
import readingTime from 'reading-time'
import { join } from 'path'
import { lqip } from './shrink'
import { load } from 'js-yaml'
import { Metadata } from 'types/metadata'

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const ARTICLES_DIR = './articles'

export async function getArticles(): Promise<string[]> {
  if (!(await exists(ARTICLES_DIR))) return []
  const article_directories = (
    await readdir(ARTICLES_DIR, { withFileTypes: true })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  return article_directories
}

export async function buildMetadata() {
  const articlePaths = await getArticles()
  const articles = await Promise.all(
    articlePaths.map((article) => getArticleMatter(article))
  )
  const metadata = load(
    await readFile('./metadata.yaml', { encoding: 'utf-8' })
  ) as Metadata

  return { articles, ...metadata }
}

export async function writeMetadata() {
  const metadata = await buildMetadata()

  await writeFile(
    join(process.cwd(), 'public/articles.json'),
    JSON.stringify(metadata)
  )
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
      const da = new Date(a.publishedDate)
      const db = new Date(b.publishedDate)

      if (da < db) return 1
      if (da > db) return -1
      return 0
    })
    .filter((article) => {
      return new Date(article.publishedDate) <= current_time
    })
  return articles
}

export function getArticleMatter(article_dir: string): ArticleMetadata {
  const file = read(`./articles/${article_dir}/index.mdx`)
  const publishedDate =
    file.data?.publishedDate?.toJSON() || new Date().toJSON()

  return {
    title: file.data.title,
    blurb: file.data.blurb,
    author: file.data.author || '',
    // @ts-expect-error path does infact exist
    path: file.path,
    jumbotron: {
      ...file.data?.jumbotron,
      url: `/images/articles/${article_dir}/${file.data?.jumbotron?.src}`,
    },
    publishedDate: file.data?.publishedDate?.toJSON() ?? new Date().toJSON(),
    editedDate: file.data?.editedDate?.toJSON() ?? publishedDate,
    keywords: file.data.keywords ?? [],
    tags: file.data.tags ?? [],
    readTime: readingTime(file.content).text,
    indexPath: `/articles/${article_dir}/index.mdx`,
    articleDir: article_dir,
  }
}

export async function getArticleMetadata(
  article_dir: string
): Promise<ArticleMetadata> {
  const file = read(`./articles/${article_dir}/index.mdx`)
  const publishedDate =
    file.data?.publishedDate?.toJSON() || new Date().toJSON()

  const dir = join(
    process.env.PWD || '',
    `./articles/${article_dir}/${file.data?.jumbotron?.src}`
  )

  await mkdir(`./public/images/articles/${article_dir}`, { recursive: true })
  await copyFile(
    `articles/${article_dir}/${file.data?.jumbotron?.src}`,
    `public/images/articles/${article_dir}/${file.data?.jumbotron?.src}`
  )

  return {
    title: file.data.title,
    blurb: file.data.blurb,
    author: file.data.author || '',
    // @ts-expect-error path does infact exist
    path: file.path,
    jumbotron: {
      ...file.data?.jumbotron,
      url: `/images/articles/${article_dir}/${file.data?.jumbotron?.src}`,
      lqip: await lqip(dir),
    },
    publishedDate: file.data?.publishedDate?.toJSON() ?? new Date().toJSON(),
    editedDate: file.data?.editedDate?.toJSON() ?? publishedDate,
    tags: file.data.tags ?? [],
    keywords: file.data.keywords ?? [],
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
  keywords: string[]
  readTime: string
  indexPath: string
  articleDir: string
  publishedDate: string
  editedDate: string
  title: string
  blurb: string
}
