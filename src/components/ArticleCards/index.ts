export interface CardDetails {
  title: string
  image: {
    lqip: string
    alt: string
    url: string
  }
  blurb: string
  readTime: string
  tags: string[]
  articleDir: string
}

export { default as SmallCard } from './Small'
export { default as MediumCard } from './Medium'
export { default as LargeCard } from './Large'

import SmallCard from './Small'
import MediumCard from './Medium'
import LargeCard from './Large'

const Cards = { Small: SmallCard, Medium: MediumCard, Large: LargeCard }

export default Cards
