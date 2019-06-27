declare module 'articles.json' {
  export interface article {
    title: string
    author: string
    blurb: string
    jumbotron: {
      src: string
      lqip: string
      alt: string
    }
    articleFile: string
    readTime: number
    tags: string[]
    publishedDate: string
    editedDate?: string
  }
  type articles = article[]
  export default articles
}
