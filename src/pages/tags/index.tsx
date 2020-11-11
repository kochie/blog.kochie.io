import React, { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'
import Image from 'next/image'

import { Jumbotron, Card, Page, Heading } from '../../components'

import metadata from '../../../metadata.yaml'
import { Tag } from 'metadata.yaml'

import styles from '../../styles/list.module.css'
import { getAllArticlesMetadata } from 'src/lib/article-path'

interface TagProps {
  tags: {
    articleCount: number
    name: string
    blurb: string
    image: {
      lqip: string
      src: string
    }
  }[]
}

const Tags = ({ tags }: TagProps): ReactElement => {
  console.log(tags)
  return (
    <>
      <Heading title={'Tags'} />
      <Page>
        <div>
          <Jumbotron
            width={'100vw'}
            height={'60vh'}
            background={
              <div className="w-full h-full bg-white dark:bg-black" />
            }
            foreground={
              <div className="text-white h-full w-full flex flex-col justify-center text-center">
                <h1 className="text-4xl">Tags</h1>
              </div>
            }
          />

          <div className="px-5 py-12 -mt-32 mb-24 max-w-5xl mx-auto grid gap-7">
            {tags.map((tag, i) => {
              return i % 2 == 0 ? (
                <Card key={tag.name}>
                  <div className={styles.cardContainer}>
                    <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                      <a className={styles.imageLink}>
                        <Image
                          layout={'fill'}
                          objectFit={'cover'}
                          src={tag.image.url}
                          alt={`${tag.name} tag`}
                          className={`${styles.tagIcon} ${styles.tagIconLeft}`}
                        />
                      </a>
                    </Link>

                    <div className={styles.info}>
                      <div className={styles.topLine}>
                        <h1 className={styles.heading}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a className="capitalize">{tag.name}</a>
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
                          layout={'fill'}
                          objectFit={'cover'}
                          src={tag.image.url}
                          alt={`${tag.name} tag`}
                          className={`${styles.tagIcon} ${styles.tagIconRight}`}
                        />
                      </a>
                    </Link>
                    <div className={styles.infoOdd}>
                      <div className={styles.topLineReverse}>
                        <h1 className={styles.heading}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a className="capitalize">{tag.name}</a>
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
  if (!Array.isArray(metadata.tags)) return { props: { tags: [] } }
  const tagsCounted = metadata?.tags.map((tag: Tag) => ({
    ...tag,
    // image: (await import(`src/assets/images/tags/${tag.image.src}`)).default,
    articleCount: articles.reduce((acc, article) => {
      return acc + (article.tags.includes(tag.name) ? 1 : 0)
    }, 0),
  }))

  return { props: { tags: tagsCounted } }
}

export default Tags
