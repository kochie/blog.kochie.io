declare module 'articles.json' {
  export interface Article {
    title: string
    author: string
    blurb: string
    jumbotron: { src: string; lqip: string; alt: string }
    articleFile: string
    readTime: number
    tags: string[]
    publishedDate: string
    editedDate?: string
  }
  type Articles = Article[]
  export default Articles
}
