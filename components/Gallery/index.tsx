import * as React from 'react'

import { Small, Medium, Large, CardDetails } from '../ArticleCards'

import style from './gallery.less'
import articles from 'articles.json'
// import { Color } from 'csstype';

type CardElement = (CardDetails: CardDetails) => JSX.Element

interface GalleryProps {
  cardOrder?: CardElement[]
  articles: articles
  backgroundColor?: string
}

export default ({
  articles,
  cardOrder = [Large, Small, Small, Small, Medium, Medium],
  backgroundColor = '',
}: GalleryProps) => {
  function calcCards(cards: articles) {
    return cards.map((article, i) => {
      const Card = cardOrder[i % cardOrder.length]
      return (
        <Card
          key={article.articleFile}
          title={article.title}
          tags={article.tags}
          image={article.jumbotron}
          articleName={article.articleFile}
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
