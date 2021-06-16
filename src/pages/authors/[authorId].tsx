import React, { ReactElement } from 'react'
// import Error from 'next/error'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Jumbotron, Gallery, Page, Heading, Card } from '../../components'
import Image from 'next/image'
import * as Fathom from 'fathom-client'

// import styles from '../../styles/author.module.css'

import metadata from '../../../metadata.yaml'
import { Author, SocialMedia } from 'metadata.yaml'
import { getAllArticlesMetadata } from '../../lib/article-path'
import { generateBlurHash } from '../../lib/encode'
import { join } from 'path'

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
      className="text-white mx-2"
      onClick={(): void => Fathom.trackGoal(sm.tracking, 0)}
      onMouseEnter={(event): void => {
        event.currentTarget.style.color = sm.color
        // event.currentTarget.style.transform = 'scale(1.2)'
      }}
      onMouseLeave={(event): void => {
        event.currentTarget.style.color = 'white'
        // event.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <FontAwesomeIcon
        icon={sm.icon}
        size={'lg'}
        className="transform-gpu hover:scale-125 duration-200 ease-in-out"
      />
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
          <div className="">
            <Jumbotron
              width={'100vw'}
              height={'70vh'}
              background={<div className="h-full bg-black" />}
              foreground={
                <div className="top-11 text-white flex h-full text-center flex-col justify-center items-center">
                  <div className="cursor-pointer w-32 h-32 mb-8 rounded-full border-4 border-white border-solid transform-gpu hover:scale-125 ease-in-out duration-200 filter grayscale-70 hover:grayscale-0 hover:border-yellow-400">
                    <Image
                      layout="fill"
                      src={`/images/authors/${authorDetails.avatar.src}`}
                      alt={`${authorDetails.fullName} Avatar`}
                      blurDataURL={authorDetails.avatar.lqip || ''}
                      placeholder="blur"
                      className="rounded-full mb-2"
                    />
                  </div>
                  <h1 className="mb-4 mt-1 text-3xl">
                    {authorDetails.fullName}
                  </h1>
                  <span className="mb-4">{`${authoredArticles.length} articles`}</span>
                  <div className="flex flex-row justify-center mt-1">
                    {authorDetails.socialMedia.map((sm) => (
                      <SocialMediaIcon sm={sm} key={sm.name} />
                    ))}
                  </div>
                  <hr className="w-28 mx-auto my-6" />
                  <div className="max-w-xs">{authorDetails.bio}</div>
                </div>
              }
            />
          </div>

          {authoredArticles.length > 0 ? (
            <div className="-mt-16">
              <Gallery articles={authoredArticles} />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto -mt-8 mb-8">
              <Card>
                <div className="p-12">
                  <p className="text-xl mb-4">Hmm...</p>
                  <p>
                    {`It looks like ${authorDetails.username} hasn't written
                    anything yet.`}
                  </p>
                  <p className="mt-2">
                    Come back later for some juicy content.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Page>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articles = await getAllArticlesMetadata()
  const authorUsername = params?.authorId

  // console.log('HELLO', articles)
  const authoredArticles = articles.filter(
    (article) => article.author === authorUsername
  )

  const authorDetails = Object.values<Author>(metadata.authors).find(
    (author) => author.username === authorUsername
  )
  if (authorDetails) {
    const lqip = await generateBlurHash(
      join(
        process.env.PWD || '',
        '/public/images/authors',
        authorDetails.avatar.src
      )
    )
    authorDetails.avatar.lqip = lqip
  }

  return { props: { authorDetails, authoredArticles } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.values<Author>(metadata?.authors).map((author) => ({
    params: { authorId: author.username },
  }))

  return {
    paths,
    fallback: false,
  }
}

export default AuthorPage
