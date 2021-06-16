import React, { ReactElement } from 'react'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import Image from 'next/image'

import { Jumbotron, Card, Page, Heading, TagSet } from '../../components'

import metadata from '../../../metadata.yaml'
import { Tag } from 'metadata.yaml'

import styles from '../../styles/list.module.css'
import { generateBlurHash, getAllArticlesMetadata } from 'src/lib/article-path'
import { join } from 'path'

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
  // console.log(tags)
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
                  <div className="h-full md:h-32 flex items-center flex-col justify-start md:flex-row group transition ease-in-out duration-500 shadow-sm hover:shadow-2xl dark:shadow-none dark:hover:shadow-none md:rounded-2xl rounded-t-2xl md:rounded-tr-none overflow-hidden">
                    <div className="h-32 md:h-full w-full md:w-72 relative overflow-hidden">
                      <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                        <a className="w-full md:w-60 h-full">
                          <Image
                            objectFit="cover"
                            objectPosition="center"
                            layout="fill"
                            src={`/images/tags/${tag.image.src}`}
                            alt={`${tag.name} tag`}
                            placeholder="blur"
                            blurDataURL={tag.image.lqip}
                            className="transform-gpu group-hover:scale-125 border-4 border-white flex-shrink-0 transition ease-in-out duration-500 filter grayscale-custom group-hover:grayscale-0"
                          />
                        </a>
                      </Link>
                    </div>
                    <div className="relative mx-4 md:my-0 my-4">
                      <div className="justify-center flex-wrap flex items-center md:justify-start mb-1">
                        <h1 className={`${styles.heading} text-2xl`}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a className="capitalize">{tag.name}</a>
                          </Link>
                        </h1>
                      </div>
                      <p className="text-center md:text-left">{tag.blurb}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={tag.name}>
                  <div className="h-full md:h-32 flex items-center flex-col justify-start md:flex-row-reverse group transition ease-in-out duration-500 shadow-sm hover:shadow-2xl dark:shadow-none dark:hover:shadow-none md:rounded-2xl rounded-t-2xl md:rounded-tl-none overflow-hidden">
                    <div className="h-32 md:h-full w-full md:w-72 relative overflow-hidden">
                      <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                        <a className="w-full md:w-60 h-full">
                          <Image
                            objectFit="cover"
                            objectPosition="center"
                            layout="fill"
                            src={`/images/tags/${tag.image.src}`}
                            alt={`${tag.name} tag`}
                            placeholder="blur"
                            blurDataURL={tag.image.lqip}
                            className="transform-gpu group-hover:scale-125 border-4 border-white flex-shrink-0 transition ease-in-out duration-500 filter grayscale-custom group-hover:grayscale-0"
                          />
                        </a>
                      </Link>
                    </div>
                    <div className="relative mx-4 md:my-0 my-4">
                      <div className="justify-center flex-wrap flex items-center md:justify-end mb-1">
                        <h1 className={`${styles.heading} text-2xl`}>
                          <Link href={'/tags/[tagId]'} as={`/tags/${tag.name}`}>
                            <a className="capitalize">{tag.name}</a>
                          </Link>
                        </h1>
                      </div>
                      <p className="text-center md:text-right">{tag.blurb}</p>
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
  const tagsCounted = metadata?.tags.map(async (tag: Tag) => ({
    ...tag,
    image: {
      src: tag.image.src,
      lqip: await generateBlurHash(join(process.env.PWD || "", '/public/images/tags', tag.image.src))
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
