import React, { ReactElement } from 'react'
import Error from 'next/error'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Jumbotron, Gallery, Page, Heading } from '../../components'
import Image from 'next/image'

import styles from '../../styles/author.module.css'

import metadata from "../../../metadata.yaml"
import {Author, SocialMedia} from "metadata.yaml"
import { getAllArticlesMetadata } from 'src/lib/article-path'

interface AuthorProps {
  authorDetails: Author
  authoredArticles: any
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
                      src={`/images/authors/${authorDetails.avatar.src}`}
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articles = await getAllArticlesMetadata()
  const authorUsername = params?.authorId

  const authoredArticles = articles.filter(
    (article) => article.author === authorUsername
  )

  const authorDetails = Object.values<Author>(metadata.authors).find(
    author => author.username === authorUsername
  )

  return { props: { authorDetails, authoredArticles } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.values<Author>(metadata.authors).map(author => ({
    params: { authorId: author.username },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default AuthorPage
