import React, { useState, useEffect, ReactElement } from 'react'

import { Small, Medium, Large, CardDetails } from '../ArticleCards'

import style from './gallery.less'
import { article } from 'articles.json'

type CardElement = (CardDetails: CardDetails) => JSX.Element

interface GalleryProps {
  cardOrder?: CardElement[]
  articles: article[]
}

export default ({
  articles,
  cardOrder = [Large, Small, Small, Small, Medium, Medium],
}: GalleryProps) => {
  function calcCards(cards: article[]) {
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

  return <div className={style.container}>{calcCards(articles)}</div>
}
