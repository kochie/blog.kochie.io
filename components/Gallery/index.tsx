import React, { useState, useEffect } from 'react'

import { Small, Medium, Large } from '../ArticleCards';

import style from "./gallery.less"
import { article } from 'articles.json';

const cardOrder = {
    largeScreen: [Large, Small, Small, Small, Medium, Medium],
    smallScreen: [Large, Medium, Medium],
    mobile: [Large]
}

export default () => {
    const [cards, setCards] = useState<article[]>([])

    function calcCards(articles: article[]) {
        const specificCardOrder = cardOrder["largeScreen"]
        return articles.map((article, i) => {
            const Card = specificCardOrder[i%specificCardOrder.length]
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

    async function getArticles() {
        const articles: article[] = await require("../../static/articles.json")
        setCards(articles)
    }

    useEffect(() => {
        getArticles()
    })

    return (
        <div className={style.container}>
            {calcCards(cards)}
        </div>
    )
}