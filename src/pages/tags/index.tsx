import React, { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'

import Jumbotron from '@/components/Jumbotron'
import Card from '@/components/Card'
import Page from '@/components/Page'
import Heading from '@/components/Heading'

import metadata from '../../../metadata.yaml'
import { Tag } from 'metadata.yaml'

import styles from '../../styles/list.module.css'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { join } from 'path'
import { lqip } from '@/lib/shrink'

interface TagProps {
  articleCount: number
  name: string
  blurb: string
  image: {
    lqip: string
    url: string
  }
}
interface TagsProps {
  tags: TagProps[]
}

const LeftTag = ({ name, blurb, image }: TagProps) => (
  <Card>
    <div className={styles.cardContainer}>
      <Link href={'/tags/[tagId]'} as={`/tags/${name}`}>
        <div className={`${styles.tagIcon} ${styles.tagIconLeft}`}>
          <a className={styles.imageLink}>
            <Image
              layout={'fill'}
              objectFit={'cover'}
              src={image.url}
              alt={`${name} tag`}
            />
          </a>
        </div>
      </Link>
      <div className={styles.info}>
        <div className={styles.topLine}>
          <h1 className={styles.heading}>
            <Link href={'/tags/[tagId]'} as={`/tags/${name}`}>
              <a>{name}</a>
            </Link>
          </h1>
        </div>
        <p>{blurb}</p>
      </div>
    </div>
  </Card>
)

const RightTag = ({ name, blurb, image }: TagProps) => (
  <Card>
    <div className={styles.cardContainerReverse}>
      <Link href={'/tags/[tagId]'} as={`/tags/${name}`}>
        <a className={styles.imageLink}>
          <Image
            layout={'fill'}
            objectFit={'cover'}
            src={image.url}
            alt={`${name} tag`}
            className={`${styles.tagIcon} ${styles.tagIconRight}`}
          />
        </a>
      </Link>
      <div className={styles.infoOdd}>
        <div className={styles.topLineReverse}>
          <h1 className={styles.heading}>
            <Link href={'/tags/[tagId]'} as={`/tags/${name}`}>
              <a>{name}</a>
            </Link>
          </h1>
        </div>
        <p>{blurb}</p>
      </div>
    </div>
  </Card>
)

const Tags = ({ tags }: TagsProps): ReactElement => {
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
          <div className={styles.listContainer}>
            {tags.map((tag, i) => {
              return i % 2 == 0 ? (
                <LeftTag key={tag.name} {...tag} />
              ) : (
                <RightTag key={tag.name} {...tag} />
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
  const tagsCounted = metadata?.tags.map(async (tag: Tag) => ({
    ...tag,
    image: {
      src: tag.image.src,
      lqip: await lqip(
        join(process.env.PWD || '', '/public/images/tags', tag.image.src)
      ),
    },
    // image: (await import(`src/assets/images/tags/${tag.image.src}`)).default,
    articleCount: articles.reduce((acc, article) => {
      return acc + (article.tags.includes(tag.name) ? 1 : 0)
    }, 0),
  }))

  const tc = await Promise.all(tagsCounted)
  return { props: { tags: tc } }
}

export default Tags
