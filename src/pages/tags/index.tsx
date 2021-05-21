import React, { ReactElement } from 'react'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import Image from 'next/image'

import { Jumbotron, Card, Page, Heading } from '../../components'

import metadata from "../../../metadata.yaml"
import {Tag} from "metadata.yaml"

import styles from '../../styles/list.module.css'
import { getAllArticlesMetadata } from 'src/lib/article-path'

interface TagProps {
  tags: {
    articleCount: number
    name: string
    blurb: string
    image: {
      lqip: string
      url: string
    }
  }[]
}

const Tags = ({ tags }: TagProps): ReactElement => {
  return (
    <>
      <Heading title={'Tags'} />
      <Page>
        <div>
          <Jumbotron
            width={'100vw'}
            height={'60vh'}
            background={<div className={styles.jumbotronBackground} />}
            foreground={
              <div className={styles.jumbotronHeading}>
                <h1>Tags</h1>
              </div>
            }
          />

          <div className={styles.listContainer}>
            {tags.map((tag, i) => {
              return i % 2 == 0 ? (
                <Card key={tag.name}>
                  <div className={styles.cardContainer}>
                    <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                      <a className={styles.imageLink}>
                        <Image
                          // width={'100%'}
                          width={120}
                          height={120}
                          // {...tag.image}
                          src={`/images/tags/${tag.image.url}`}
                          alt={`${tag.name} tag`}
                          className={[styles.tagIcon, styles.tagIconLeft].join(
                            ' '
                          )}
                        />
                      </a>
                    </Link>

                    <div className={styles.info}>
                      <div className={styles.topLine}>
                        <h1 className={styles.heading}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a>{tag.name}</a>
                          </Link>
                        </h1>
                      </div>
                      <p>{tag.blurb}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={tag.name}>
                  <div className={styles.cardContainerReverse}>
                    <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                      <a className={styles.imageLink}>
                        <Image
                          // width={'100%'}
                          width={120}
                          height={120}
                          src={`/images/tags/${tag.image.url}`}
                          alt={`${tag.name} tag`}
                          className={[styles.tagIcon, styles.tagIconRight].join(
                            ' '
                          )}
                        />
                      </a>
                    </Link>
                    <div className={styles.infoOdd}>
                      <div className={styles.topLineReverse}>
                        <h1 className={styles.heading}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a>{tag.name}</a>
                          </Link>
                        </h1>
                      </div>
                      <p>{tag.blurb}</p>
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
  // const tags = new Map<string, number>()
  const articles = await getAllArticlesMetadata()
  const tagsCounted = await Promise.all(
    metadata.tags.map(async (tag: Tag) => ({
      ...tag,
      // image: (await import(`src/assets/images/tags/${tag.image.src}`)).default,
      articleCount: articles.reduce((acc, article) => {
        return acc + (article.tags.includes(tag.name) ? 1 : 0)
      }, 0),
    }))
  )

  return { props: { tags: tagsCounted } }
}

export default Tags
