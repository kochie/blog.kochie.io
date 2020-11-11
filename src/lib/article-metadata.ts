/* eslint-disable import/no-unresolved */
import { Article } from 'articles.json'
import { opendir, readFile } from 'fs/promises'
import { join } from 'path'
// import { readingTime } from 'reading-time-estimator'
import { validate, ValidationError } from 'jsonschema'
import TOML from '@iarna/toml'

const collectArticles = async (): Promise<Article[]> => {
  const articles: Article[] = []

  const dir = await opendir(join(__dirname, '../articles'))
  for await (const dirent of dir) {
    // console.log(dirent.name);
    if (dirent.isDirectory()) {
      try {
        const article = await readArticleToml(join(dirent.name, 'article.toml'))
        articles.push(article)
      } catch (err) {
        if (err instanceof ValidationError) {
          console.warn(`article in ${dirent.name} skipped because ${err}`)
          continue
        }
      }
    }
  }

  return articles
}

const readArticleToml = async (filename: string): Promise<Article> => {
  const file = await readFile(filename)
  const article_schema = {}
  const article = TOML.parse(file.toString()) as unknown
  validate(article, article_schema, { throwError: true })
  return article as Article
}

export { collectArticles }
