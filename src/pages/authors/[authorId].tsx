import React, { ReactElement } from 'react'
import Error from 'next/error'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Jumbotron, Gallery, Image, Page, Heading } from '../../components'

import styles from '../../styles/author.module.css'

import articles from '../../../public/articles.json'
import authors from '../../../public/authors.json'
// eslint-disable-next-line import/no-unresolved
import Articles from 'articles.json'
// eslint-disable-next-line import/no-unresolved
import { Author, SocialMedia } from 'authors.json'

interface AuthorProps {
  authorDetails: Author
  authoredArticles: Articles
  avatar: Image
}

library.add(fab, fal)

interface SocialMediaIconProps {
  sm: SocialMedia
}

const SocialMediaIcon = ({ sm }: SocialMediaIconProps): ReactElement => {
  return (
    <a
      key={sm.name}
      href={sm.link}
      className={styles.mediaIcon}
      onClick={(): void => fathom.trackGoal(sm.tracking, 0)}
      onMouseEnter={(event): void => {
        event.currentTarget.style.color = sm.color
        event.currentTarget.style.transform = 'scale(1.2)'
      }}
      onMouseLeave={(event): void => {
        event.currentTarget.style.color = 'white'
        event.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <FontAwesomeIcon icon={sm.icon} size={'lg'} />
    </a>
  )
}

const AuthorPage = ({
  authorDetails,
  authoredArticles,
  avatar,
}: AuthorProps): ReactElement => {
  return (
    <>
      <Heading title={`${authorDetails.fullName}'s Articles`} />
      <Page>
        <div>
          <div className={styles.jumboContainer}>
            <Jumbotron
              width={'100vw'}
              height={'70vh'}
              background={<div className={styles.background} />}
              foreground={
                <div className={styles.foreground}>
                  <div className={styles.avatarContainer}>
                    <Image
                      width={120}
                      height={120}
                      lqip={avatar.lqip}
                      src={avatar.url}
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
                      <SocialMediaIcon sm={sm} key={sm.name} />
                    ))}
                  </div>

                  <hr className={styles.hr} />

                  <div className={styles.bio}>{authorDetails.bio}</div>
                </div>
              }
            />
          </div>

          {authoredArticles.length > 0 ? (
            <div style={{ marginTop: -60 }}>
              <Gallery articles={authoredArticles} />
            </div>
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

  const img = (
    await import(`src/assets/images/authors/${authorDetails?.avatar.src}`)
  ).default
  const avatar = { ...img }

  const newArticlesPromise = authoredArticles.map(async (article) => {
    const jumbotron = (
      await import(`articles/${article.articleDir}/${article.jumbotron.src}`)
    ).default

    const url = jumbotron.url
    const lqip = jumbotron.lqip

    return { ...article, jumbotron: { url, lqip, ...article.jumbotron } }
  })

  const newArticles = await Promise.all(newArticlesPromise)

  return { props: { authorDetails, authoredArticles: newArticles, avatar } }
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
