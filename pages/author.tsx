import React from 'react'
import { Jumbotron, Gallery, Image } from '../components'

import styles from "../styles/author.less"
import Head from 'next/head';
import { NextDocumentContext } from 'next/document';

import articles from "../static/articles.json"
import authors from "../static/authors.json"

import Articles, { Article } from 'articles.json';
import { Author } from 'authors.json';
import Error from 'next/error';
import { ThemeProvider } from 'fannypack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTwitterSquare, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from "@fortawesome/pro-light-svg-icons"
library.add(fab, fal)

interface AuthorProps {
    authorDetails: Author
    authoredArticles: Articles
}

const AuthorPage = ({authorDetails, authoredArticles}: AuthorProps) => {
  return (
    <ThemeProvider>
    <Head>
        <title>{`${authorDetails.fullName}'s Articles`}</title>
        <link rel="stylesheet" type="text/css" href="/static/styles/main.css" />
    </Head>
    <div className={styles.container}>
      <Jumbotron
        width={'100vw'}
        height={'50vh'}
        background={<div className={styles.background}/>}
        foreground={
            <div className={styles.foreground}>
                <Image
                    width={120} 
                    height={120}
                    {...authorDetails.avatar}
                    alt={`${authorDetails.fullName} Avatar`}
                    className={styles.avatar}
                />
                <h1 className={styles.heading}>{authorDetails.fullName}</h1>
                <span className={styles.articleQuantity}>{`${authoredArticles.length} articles`}</span>
                <div className={styles.socialMedia}>
                    {authorDetails.socialMedia.map(sm => (
                        <a 
                            key={sm.name} 
                            href={sm.link}
                            className={styles.mediaIcon}
                            onMouseEnter={(event) => {
                                event.currentTarget.style.color = sm.color
                                event.currentTarget.style.transform = 'scale(1.2)'
                            }}
                            onMouseLeave={(event) => {
                                event.currentTarget.style.color = "white"
                                event.currentTarget.style.transform = 'scale(1)'
                            }}
                        >
                            <FontAwesomeIcon 
                                // color="white" 
                                icon={sm.icon} 
                                size={'lg'}
                                width={0}
                            />
                        </a>
                    ))}
                </div>
            </div>
        }
      />
      {
        authoredArticles.length > 0 ? <Gallery articles={authoredArticles}/> : <Error statusCode={404}/>
      }
    </div>
    </ThemeProvider>
  )
}

AuthorPage.getInitialProps = ({ query }: NextDocumentContext) => {
    const authorUsername = query.author || ""
    // console.log(authorUsername)

    if (Array.isArray(authorUsername)) {

    } else {
        const authoredArticles = articles.filter((article: Article) => (article.author === authorUsername))
        const authorDetails = authors.find((author: Author) => (author.username === authorUsername))
        // console.log(authorDetails)
        return ({authorDetails, authoredArticles})
    }
}

export default AuthorPage