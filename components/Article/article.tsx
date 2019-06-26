import { Image } from "..";
import { article } from "articles.json";

import React from 'react'

// import HelloWorld from '../posts/HelloWorld.mdx'

export default (article: article) => {
    return (
        <Image height={'70vh'} width={'100vh'} {...article.jumbotron} />
    )
}