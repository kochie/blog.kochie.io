import { Image, Footer } from "..";
import { article } from "articles.json";

import React from 'react'
import Error from "next/error";
import dynamic from "next/dynamic";
import {Tag, Set} from 'fannypack'

import style from './article.less';

export default (article: article) => {
    const DynamicComponent = dynamic(() => import(`../../posts/${article.articleFile}.mdx`).catch((error: {message: string}) => {
        if (error.message === `Cannot find module './${article.articleFile}.mdx'`) {
            return () => (
                <Error statusCode={404} />
            )
        } else {
            throw error
        }
    }), {
        loading: () => <p>...</p>
    });

    return (
        <>
            <div style={{backgroundColor: 'black'}}>
                {/* <div className={style.title}>
                    <div className={style.glass} style={{backgroundImage: `url(${article.jumbotron.lqip})`}}/>
                    <h1 className={style.text}></h1>
                </div> */}
                <Image height={'70vh'} width={'100vw'} {...article.jumbotron} />
            </div>
            <div className={style.card}>
                <div>
                    <h1>{article.title}</h1>
                    <span>{article.readTime} min read</span>
                    <span>Written by {article.author}</span>
                    <span>Published on {new Date(article.publishedDate).toLocaleDateString('en')}</span>
                    {!article.editedDate ? null : <span>Last edited on {new Date(article.editedDate).toLocaleDateString('en')}</span>}
                    <Set>
                        {article.tags.map(tag => (<Tag kind="outlined">{tag}</Tag>))}
                    </Set>
                </div>
                <DynamicComponent />
            </div>
            <Footer title={"Kochie Engineering"} links={[]}/>
        </>
    )
}