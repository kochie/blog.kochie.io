import React, { ReactElement } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'
import { Card, Page, Heading, Jumbotron } from '../../components'

// import authors from '../../../public/authors.json'
// eslint-disable-next-line import/no-unresolved
// import { Author as AuthorMetadata } from 'authors.json'

import metadata from "../../../metadata.yaml"
import {Author} from "metadata.yaml"

import styles from '../../styles/list.module.css'

library.add(fab, fal)

// import avatarStyles from '../../styles/author.less'

interface AuthorProps {
  authors: {[key: string]: Author}
}

function smButton(sm: import('authors.json').SocialMedia): JSX.Element {
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
        event.currentTarget.style.color = ''
        event.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <FontAwesomeIcon icon={sm.icon} size={'lg'} className={styles.icon} />
    </a>
  )
}

const Authors = ({ authors }: AuthorProps): ReactElement => {
  return (
    <>
      <Heading title={'Authors'} />
      <Page>
        <div>
          <Jumbotron
            width={'100vw'}
            height={'60vh'}
            background={<div className={styles.jumbotronBackground} />}
            foreground={
              <div className={styles.jumbotronHeading}>
                <h1>Authors</h1>
              </div>
            }
          />

          <div className={styles.listContainer}>
            {Object.values(authors).map((author: Author, i) => {
              // const avatar = avatars[i]
              return i % 2 === 0 ? (
                <Card key={author.username}>
                  <div
                    className={[
                      styles.cardContainer,
                      styles.cardContainerPadding,
                    ].join(' ')}
                  >
                    <Link
                      href={'/authors/[authorId]'}
                      as={`/authors/${author.username}`}
                    >
                      <div className={styles.avatarContainer}>
                        <a>
                          <Image
                            width={120}
                            height={120}
                            src={`/images/authors/${author.avatar.src}`}
                            alt={`${author.fullName} Avatar`}
                            className={[styles.avatar].join(' ')}
                          />
                        </a>
                      </div>
                    </Link>

                    <div className={styles.info}>
                      <div className={styles.topLine}>
                        <h1 className={styles.heading}>
                          <Link
                            href={'/authors/[authorId]'}
                            as={`/authors/${author.username}`}
                          >
                            <a>{author.fullName}</a>
                          </Link>
                        </h1>
                        <div className={styles.socialMediaContainer}>
                          {author.socialMedia.map((sm) => smButton(sm))}
                          {smButton({
                            name: 'email',
                            link: 'mailto:robert@kochie.io',
                            icon: ['fal', 'envelope'],
                            color: 'red',
                            tracking: '',
                          })}
                        </div>
                      </div>
                      <p>{author.bio}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={author.username}>
                  <div
                    className={[
                      styles.cardContainerReverse,
                      styles.cardContainerPadding,
                    ].join(' ')}
                  >
                    <Link
                      href={'/authors/[authorId]'}
                      as={`/authors/${author.username}`}
                    >
                      <a>
                        <div style={{ width: 120, height: 120 }}>
                          <Image
                            width={120}
                            height={120}
                            src={`/images/authors/${author.avatar.src}`}
                            alt={`${author.fullName} Avatar`}
                            className={[styles.avatar].join(' ')}
                          />
                        </div>
                      </a>
                    </Link>

                    <div className={styles.infoOdd}>
                      <div className={styles.topLineReverse}>
                        <h1 className={styles.heading}>
                          <Link
                            href={'/authors/[authorId]'}
                            as={`/authors/${author.username}`}
                          >
                            <a>{author.fullName}</a>
                          </Link>
                        </h1>
                        <div className={styles.socialMediaContainer}>
                          {author.socialMedia.map((sm) => smButton(sm))}
                          {smButton({
                            name: 'email',
                            link: 'mailto:robert@kochie.io',
                            icon: ['fal', 'envelope'],
                            color: 'red',
                            tracking: '',
                          })}
                        </div>
                      </div>
                      <p>{author.bio}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </Page>
    </>
  )
}

// Authors.getInitialProps = () => {
//   return { authors }
// }

export const getStaticProps: GetStaticProps = async () => {
  // const avatars = metadata.authors.map(async (author: Author) => `/images/authors/${author.avatar.src}`)

  // const avatars = await Promise.all(avatarsPromise)

  // console.log(avatars)

  return { props: { authors: metadata.authors } }
}

export default Authors
