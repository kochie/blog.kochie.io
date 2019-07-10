import { Image, Footer, Jumbotron } from '..'
import { Article as ArticleMetadata } from 'articles.json'
import { Author as AuthorMetadata } from 'authors.json'

import React from 'react'
import Error from 'next/error'
import dynamic from 'next/dynamic'
import { Tag, Set } from 'fannypack'

import style from '../../styles/article.less'
import Link from 'next/link'

interface ArticleProps {
  article: ArticleMetadata
  author: AuthorMetadata
}

const Article = ({ article, author }: ArticleProps) => {
  const DynamicComponent = dynamic(
    () =>
      import(`../../articles/${article.articleDir}/index.mdx`).catch(
        (error: { message: string }) => {
          if (
            error.message ===
            `Cannot find module './${article.articleDir}/index.mdx'`
          ) {
            return () => (
              <Error title={"Article doesn't exist"} statusCode={404} />
            )
          } else {
            throw error
          }
        }
      ),
    {
      loading: () => <p> ... </p>,
    }
  )

  const AuthorLink = () => (
    <Link href={`/authors/${author.username}`}>
      <a>{author.fullName}</a>
    </Link>
  )

  return (
    <>
      <Jumbotron
        height={'70vh'}
        width={'100vw'}
        background={
          <Image height={'70vh'} width={'100vw'} {...article.jumbotron} />
        }
        foreground={<div className={style.imageForeground} />}
        // foreground={
        // <div className={style.title}>
        //             <div className={style.glass} style={{backgroundImage: `url(${article.jumbotron.lqip})`}}/>
        //             <h1 className={style.text}></h1>
        //         </div>
        // }
      />
      <div className={style.container}>
        <div>
          <div className={style.card}>
            <div>
              <div>
                <span className={style.subText}>
                  {`Published on ${new Date(
                    article.publishedDate
                  ).toLocaleDateString('en')}`}
                </span>
              </div>
              <h1 className={style.heading}>{article.title}</h1>
              <div className={style.details}>
                <span className={style.subText}>
                  {`Written by `}
                  <AuthorLink />
                </span>
                {!article.editedDate ? null : (
                  <span className={style.subText}>
                    {`Last edited on ${new Date(
                      article.editedDate
                    ).toLocaleDateString('en')}`}
                  </span>
                )}
                <span className={style.subText}>
                  {article.readTime} min read
                </span>
              </div>
              <Set style={{ marginTop: '5px' }}>
                {article.tags.map(tag => (
                  <Tag key={tag} kind="outlined">
                    {tag}
                  </Tag>
                ))}
              </Set>
            </div>
            <DynamicComponent />
          </div>
        </div>
      </div>
      <Footer title={'Kochie Engineering'} links={[]} />
    </>
  )
}

export default Article
