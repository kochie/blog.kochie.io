import React from 'react'
import Link from 'next/link'
import { Image, Jumbotron, Card, Tag, TagSet } from '..'

// eslint-disable-next-line import/no-unresolved
import { Article as ArticleDetails } from 'articles.json'
// eslint-disable-next-line import/no-unresolved
import { Author as AuthorDetails } from 'authors.json'

import style from './Article.module.css'

interface ArticleProps {
  article: ArticleDetails
  author: AuthorDetails
  children: React.ReactNode
  jumbotron: Image
}

interface AuthorLinkProps {
  username: string
  fullname: string
}

const Article = ({
  article,
  author,
  children,
  jumbotron,
}: ArticleProps): React.ReactElement => {
  // const DynamicComponent = dynamic(
  //   () =>
  //     import(`../../../articles/${article.articleDir}/index.mdx`).catch(
  //       (error: { message: string }) => {
  //         if (
  //           error.message ===
  //           `Cannot find module './${article.articleDir}/index.mdx'`
  //         ) {
  //           return () => (
  //             <Error title={"Article doesn't exist"} statusCode={404} />
  //           )
  //         } else {
  //           throw error
  //         }
  //       }
  //     ),
  //   {
  //     loading: () => <p> ... </p>
  //   }
  // )

  const AuthorLink = ({
    username,
    fullname,
  }: AuthorLinkProps): React.ReactElement => {
    const link = (
      <Link href={'/authors/[authorId]'} as={`/authors/${username}`}>
        <a className={style.underline}>{fullname}</a>
      </Link>
    )
    return (
      <>
        <p>Written by {link}</p>
      </>
    )
  }

  return (
    <>
      <Jumbotron
        height={'70vh'}
        width={'100vw'}
        background={
          <div style={{ width: '100vw', height: '70vh' }}>
            <Image src={jumbotron.url} lqip={jumbotron.lqip} />
          </div>
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
          <Card>
            <div className={style.card}>
              <h1 className={style.heading}>{article.title}</h1>
              <TagSet className={style.tagset}>
                {article.tags.map((tag) => (
                  // <div key={tag}>{tag}</div>
                  <Tag name={tag} link={`/tags/${tag}`} key={tag} />
                ))}
              </TagSet>
              {/* <hr className={style.hr} /> */}
              <div>
                <span className={style.subText}>
                  {`Published on ${new Date(
                    article.publishedDate
                  ).toLocaleDateString('en')}`}
                </span>
              </div>
              <div className={style.details}>
                <div>
                  <div>
                    <span className={style.subText}>
                      <AuthorLink
                        username={author.username}
                        fullname={author.fullName}
                      />
                    </span>
                  </div>
                  <div>
                    {!article.editedDate ? null : (
                      <span className={style.subText}>
                        {`Last edited on ${new Date(
                          article.editedDate
                        ).toLocaleDateString('en')}`}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={style.subText}>
                      {article.readTime} min read
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '5px' }}></div>
              {/* <DynamicComponent /> */}
              {children}
            </div>
          </Card>
        </div>
      </div>
      {/* <Footer title={'Kochie Engineering'} links={[]} /> */}
    </>
  )
}

export default Article
