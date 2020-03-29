import React from 'react'
import { Jumbotron, Gallery, Image, Page } from '../../components'
import styles from '../../styles/author.module.scss'
import Head from 'next/head'
import articles from '../../../public/articles.json'
import authors from '../../../public/authors.json'
import Articles from 'articles.json'
import { Author } from 'authors.json'
import Error from 'next/error'
// import { ThemeProvider } from 'fannypack'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
// import { DocumentContext } from 'next/document'
import { GetStaticProps, GetStaticPaths } from 'next'

interface AuthorProps {
  authorDetails: Author
  authoredArticles: Articles
}

library.add(fab, fal)

const AuthorPage = ({ authorDetails, authoredArticles }: AuthorProps) => {
  return (
    <>
      <Head>
        <title>{`${authorDetails.fullName}'s Articles`}</title>
      </Head>
      <Page>
        <div>
          <div className={styles.jumboContainer}>
            <Jumbotron
              width={'100vw'}
              height={'60vh'}
              background={<div className={styles.background} />}
              foreground={
                <div className={styles.foreground}>
                  <div>
                    <Image
                      width={120}
                      height={120}
                      {...authorDetails.avatar}
                      alt={`${authorDetails.fullName} Avatar`}
                      className={styles.avatar}
                    />
                  </div>

                  <h1 className={styles.heading}>{authorDetails.fullName}</h1>

                  <span
                    className={styles.articleQuantity}
                  >{`${authoredArticles.length} articles`}</span>

                  <div className={styles.socialMedia}>
                    {authorDetails.socialMedia.map((sm) => (
                      <a
                        key={sm.name}
                        href={sm.link}
                        className={styles.mediaIcon}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.color = sm.color

                          event.currentTarget.style.transform = 'scale(1.2)'
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.color = 'white'

                          event.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <FontAwesomeIcon
                          // color="white"

                          icon={sm.icon}
                          size={'lg'}

                          // width={0}

                          // style={{width: 0}}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              }
            />
          </div>

          {authoredArticles.length > 0 ? (
            <Gallery articles={authoredArticles} />
          ) : (
            <Error title="author not found" statusCode={404} />
          )}
        </div>
      </Page>
    </>
  )
}

// AuthorPage.getInitialProps = ({ query }: DocumentContext) => {
//   const authorUsername = query.authorId || ''

//   if (Array.isArray(authorUsername)) {
//   } else {
//     const authoredArticles = articles.filter(
//       article => article.author === authorUsername
//     )

//     const authorDetails = authors.find(
//       author => author.username === authorUsername
//     )

//     return { authorDetails, authoredArticles }
//   }
// }

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const authorUsername = params?.authorId

  const authoredArticles = articles.filter(
    (article) => article.author === authorUsername
  )

  const authorDetails = authors.find(
    (author) => author.username === authorUsername
  )

  return { props: { authorDetails, authoredArticles } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = authors.map((author) => ({
    params: { authorId: author.username },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default AuthorPage
