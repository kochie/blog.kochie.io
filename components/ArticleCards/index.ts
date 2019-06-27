export interface CardDetails {
  title: string
  image: {
    src: string
    lqip: string
    alt: string
  }
  blurb: string
  readTime: number
  tags: string[]
  articleName: string
}

export { default as Small } from './Small'
export * from './Small'
export { default as Medium } from './Medium'
export * from './Medium'
export { default as Large } from './Large'
export * from './Large'

import Small from './Small'
import Medium from './Medium'
import Large from './Large'

export default { Small, Medium, Large }
