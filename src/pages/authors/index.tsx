import React, { ReactElement } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fal } from '@fortawesome/pro-light-svg-icons'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'
import { Card, Page, Heading, Jumbotron } from '../../components'
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
      className="text-white transition ease-in-out duration-200"
      onClick={(): void => fathom.trackGoal(sm.tracking, 0)}
      onMouseEnter={(event): void => {
        event.currentTarget.style.color = sm.color
        // event.currentTarget.style.transform = 'scale(1.2)'
      }}
      onMouseLeave={(event): void => {
        event.currentTarget.style.color = ''
        // event.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <FontAwesomeIcon icon={sm.icon} size='1x' className="mx-1 transform-gpu transition duration-200 ease-in-out" />
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
            background={<div className="bg-black w-full h-full" />}
            foreground={
              <div className="text-white h-full w-full flex flex-col justify-center text-center">
                <h1 className="text-4xl">Authors</h1>
              </div>
            }
          />

          <div className="px-5 py-12 -mt-32 max-w-5xl mx-auto grid gap-7">
            {Object.values(authors).map((author: Author, i) => {
              // const avatar = avatars[i]
              return i % 2 === 0 ? (
                <Card key={author.username}>
                  <div
                    className="p-5 flex items-center flex-col justify-start md:flex-row"
                  >
                      <div className="w-32 h-32 relative border-4 border-white border-solid rounded-full mr-4 overflow-hidden">
                    <Link
                      href={'/authors/[authorId]'}
                      as={`/authors/${author.username}`}
                    >
                        <a>
                          <Image
                            layout='fill'
                            src={`/images/authors/${author.avatar.src}`}
                            alt={`${author.fullName} Avatar`}
                            className="transform-gpu hover:scale-110 flex-shrink-0 transition ease-in-out duration-500 filter grayscale-70 cursor-pointer hover:grayscale-0"
                          />
                        </a>
                    </Link>
                      </div>

                    <div className="m-4">
                      <div className="flex-wrap flex items-center text-2xl">
                        <h1 className={styles.heading}>
                          <Link
                            href={'/authors/[authorId]'}
                            as={`/authors/${author.username}`}
                          >
                            <a>{author.fullName}</a>
                          </Link>
                        </h1>
                        <div className="flex ml-4">
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
                    className="p-5 flex items-center flex-col justify-start md:flex-row-reverse"
                  >
                    <Link
                      href={'/authors/[authorId]'}
                      as={`/authors/${author.username}`}
                    >
                        <div className="w-32 h-32 relative border-4 border-white border-solid rounded-full ml-4 overflow-hidden">
                          <a>
                          <Image
                            layout='fill'
                            src={`/images/authors/${author.avatar.src}`}
                            alt={`${author.fullName} Avatar`}
                            className="transform-gpu hover:scale-110 flex-shrink-0 transition ease-in-out duration-500 filter grayscale-70 cursor-pointer hover:grayscale-0"
                          />
                          </a>
                        </div>
                    </Link>

                    <div className="m-4">
                      <div className="flex-wrap flex flex-row-reverse items-center text-2xl">
                        <h1 className={styles.heading}>
                          <Link
                            href={'/authors/[authorId]'}
                            as={`/authors/${author.username}`}
                          >
                            <a>{author.fullName}</a>
                          </Link>
                        </h1>
                        <div className="flex mr-4">
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
                      <p className="text-right">{author.bio}</p>
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

export const getStaticProps: GetStaticProps = async () => {
  return { props: { authors: metadata.authors } }
}

export default Authors
