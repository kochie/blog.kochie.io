import { readdir, access } from 'fs/promises'
import matter from 'gray-matter';
import readingTime from 'reading-time';

async function exists (path: string) {  
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export async function getArticles() {
  if (!(await exists('./public/articles'))) return []
  const article_directories = (await readdir('./public/articles', { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  return article_directories
}

export async function getAllArticlesMetadata() {
  const article_directories = await getArticles()
  const articles = article_directories.map(article_dir => getArticleMetadata(article_dir))
  return articles
}

export function getArticleMetadata(article_dir: string) {
    const file = matter.read(`./public/articles/${article_dir}/index.mdx`)

    return {
      ...file.data, 
      author: file.data.author || "",
      path: (file as any).path,
      jumbotron: {...file.data?.jumbotron, url: `/articles/${article_dir}/${file.data?.jumbotron?.src}` },
      publishedDate: file.data?.publishedDate?.toJSON() || new Date().toJSON(),
      tags: file.data?.tags || [],
      readTime: readingTime(file.content).text,
      indexPath: `/articles/${article_dir}/index.mdx`,
      articleDir: article_dir
    }
}

export interface ArticleMetadata {
  author: string
  path: string
  jumbotron: {
    url: string
    alt: string
  },
  tags: string[]
  readTime: string
  indexPath: string
  articleDir: string
  publishedDate: string
  editedDate: string
  title: string
  blurb: string
}