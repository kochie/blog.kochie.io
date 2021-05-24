import React, { ReactElement } from 'react'

import { SmallCard, MediumCard, LargeCard, CardDetails } from '..'

import style from './Gallery.module.css'

// eslint-disable-next-line import/no-unresolved
import articles from 'articles.json'

type CardElement = (CardDetails: CardDetails) => JSX.Element

interface GalleryProps {
  articles: articles
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
  backgroundColor = '',
}: GalleryProps): ReactElement => {
  function calcCards(cards: articles): ReactElement[] {
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
