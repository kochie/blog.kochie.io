import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Card, Jumbotron } from '@/components'

import styles from '@/styles/list.module.css'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { join } from 'path'
import { lqip } from '@/lib/shrink'
import { Tag } from 'types/metadata'
import { Metadata } from 'next'

import metadata from '$metadata'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tags',
    description: 'The tags used in my blog posts.',
  }
}

const Tags = async () => {
  const articles = await getAllArticlesMetadata()
  const tagsCounted = metadata.tags.map(async (tag: Tag) => ({
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

  return (
    <>
      <div>
        <Jumbotron
          width={'100vw'}
          height={'60vh'}
          background={<div className="w-full h-full bg-white dark:bg-black" />}
          foreground={
            <div className="text-white h-full w-full flex flex-col justify-center text-center">
              <h1 className="text-4xl">Tags</h1>
            </div>
          }
        />

        <div className="px-5 py-12 -mt-32 mb-24 max-w-5xl mx-auto grid gap-7">
          {tc.map((tag, i) => {
            return i % 2 == 0 ? (
              <Card key={tag.name}>
                <div className="h-full md:h-32 flex items-center flex-col justify-start md:flex-row group transition ease-in-out duration-500 shadow-sm hover:shadow-2xl dark:shadow-none dark:hover:shadow-none md:rounded-2xl rounded-t-2xl md:rounded-tr-none overflow-hidden">
                  <div className="h-32 md:h-full w-full md:w-72 relative overflow-hidden">
                    <Link
                      href={`/tags/${tag.name.toLowerCase()}`}
                      className="w-full md:w-60 h-full"
                    >
                      <div className="w-full h-full transition ease-in-out duration-500 filter grayscale-custom group-hover:grayscale-0 relative">
                        <Image
                          src={`/images/tags/${tag.image.src}`}
                          alt={`${tag.name} tag`}
                          blurDataURL={tag.image.lqip}
                          placeholder="blur"
                          className="transform-gpu group-hover:scale-125 flex-shrink-0 transition ease-in-out duration-500 filter grayscale-custom group-hover:grayscale-0"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="relative mx-4 md:my-0 my-4">
                    <div className="justify-center flex-wrap flex items-center md:justify-start mb-1">
                      <h1 className={`${styles.heading} text-2xl`}>
                        <Link href={`/tags/${tag.name}`} className="capitalize">
                          {tag.name}
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
                    <Link
                      href={`/tags/${tag.name.toLowerCase()}`}
                      className="w-full md:w-60 h-full"
                    >
                      <div className="w-full h-full transition ease-in-out duration-500 filter grayscale-custom group-hover:grayscale-0 relative">
                        <Image
                          src={`/images/tags/${tag.image.src}`}
                          alt={`${tag.name} tag`}
                          blurDataURL={tag.image.lqip}
                          placeholder="blur"
                          className="transform-gpu group-hover:scale-125 flex-shrink-0 transition ease-in-out duration-500 filter grayscale-custom group-hover:grayscale-0"
                          fill
                          sizes="100vw"
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="relative mx-4 md:my-0 my-4">
                    <div className="justify-center flex-wrap flex items-center md:justify-end mb-1">
                      <h1 className={`${styles.heading} text-2xl`}>
                        <Link href={`/tags/${tag.name}`} className="capitalize">
                          {tag.name}
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
    </>
  )
}

export default Tags
