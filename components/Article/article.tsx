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
            <div className={style.container}>
            <div className={style.card}>
                <div>
                    <div><span className={style.subText}>
                        Published on {new Date(article.publishedDate).toLocaleDateString('en')}
                    </span></div>
                    <h1 className={style.heading}>{article.title}</h1>
                    <div className={style.details}>
                        <span className={style.subText}>Written by {article.author}</span>
                        {
                            !article.editedDate ? 
                            null : 
                            <span className={style.subText}>
                                Last edited on {new Date(article.editedDate).toLocaleDateString('en')}
                            </span>
                        }
                        <span className={style.subText}>{article.readTime} min read</span>
                    </div>
                    <Set style={{marginTop: '5px'}}>
                        {article.tags.map(tag => (<Tag kind="outlined">{tag}</Tag>))}
                    </Set>
                </div>
                <DynamicComponent />
            </div>
            </div>
            <Footer title={"Kochie Engineering"} links={[]}/>
        </>
    )
}