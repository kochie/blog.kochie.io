import React, { useState, useEffect } from 'react'

import { Small, Medium, Large } from '../ArticleCards';

import style from "./gallery.less"
import { article } from 'articles.json';

const cardOrder = [Large, Small, Small, Small, Medium, Medium]

export default () => {
    const [cards, setCards] = useState<article[]>([])

    function calcCards(articles: article[]) {
        return articles.map((article, i) => {
            const Card = cardOrder[i%cardOrder.length]
            return (
                <Card 
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