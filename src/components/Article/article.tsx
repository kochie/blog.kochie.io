import { Image, Jumbotron } from '..'
import { Article as ArticleMetadata } from 'articles.json'
import { Author as AuthorMetadata } from 'authors.json'

import React from 'react'
// import Error from 'next/error'
// import dynamic from 'next/dynamic'

import style from '../../styles/article.module.scss'
import Link from 'next/link'
import Card from '../Card'
import { Tag, TagSet } from '../Tag'

interface ArticleProps {
  article: ArticleMetadata
  author: AuthorMetadata
  children: React.ReactNode
  jumbotron: Image
}

// export async function getStaticProps(context) {

// }

const Article = ({ article, author, children, jumbotron }: ArticleProps) => {
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

  const AuthorLink = () => (
    <Link href={'/authors/[authorId]'} as={`/authors/${author.username}`}>
      <a className={style.underline}>{author.fullName}</a>
    </Link>
  )

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
                      {`Written by `}
                      <AuthorLink />
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
