import React, { ReactElement } from 'react'
import { LargeCard, MediumCard, SmallCard } from '@/components/ArticleCards'
import type { CardDetails } from '@/components/ArticleCards'

import style from './Gallery.module.css'
import { ArticleMetadata } from '@/lib/article-path'

type CardElement = (CardDetails: CardDetails) => JSX.Element

interface GalleryProps {
  articles: ArticleMetadata[]
  cardOrder?: CardElement[]
  backgroundColor?: string
}

const Gallery = ({
  articles,
  cardOrder = [
    LargeCard,
    SmallCard,
    SmallCard,
    SmallCard,
    MediumCard,
    MediumCard,
  ],
  backgroundColor = 'transparent',
}: GalleryProps): ReactElement => {
  function calcCards(cards: ArticleMetadata[]): ReactElement[] {
    return cards.map((article, i): ReactElement => {
      const Card = cardOrder[i % cardOrder.length]
      return (
        <Card
          key={article.articleDir}
          title={article.title}
          tags={article.tags}
          image={article.jumbotron}
          articleDir={article.articleDir}
          readTime={article.readTime}
          blurb={article.blurb}
        />
      )
    })
  }

  return (
    <div className={style.container} style={{ backgroundColor }}>
      {calcCards(articles)}
    </div>
  )
}

export default Gallery
