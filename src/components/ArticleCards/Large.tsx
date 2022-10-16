import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CardDetails } from '@/components/ArticleCards'
import Card from '@/components/Card'
import { Tag, TagSet } from '@/components/Tag'

import style from './ArticleCards.module.css'

const LargeCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): React.ReactElement => {
  return (
    <div className="md:flex w-full h-full col-span-6 group shadow-sm hover:shadow-2xl dark:shadow-none transition ease-in-out duration-200 rounded-2xl">
      <Card>
        <div className="flex flex-col md:flex-row md:h-72 lg:h-96">
          <div className="relative rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none md:w-1/2 lg:w-2/3 overflow-hidden">
            <Link
              href={'/articles/[articleId]'}
              as={`/articles/${articleDir}`}
              passHref
            >
              <div className="transition h-56 md:h-full ease-in-out duration-200 group-hover:grayscale-0 grayscale-30 filter">
                <Image
                  src={image.url}
                  alt={image.alt}
                  layout={'fill'}
                  objectFit="cover"
                  blurDataURL={image.lqip}
                  placeholder="blur"
                  className="rounded-t-2xl h-full md:rounded-l-2xl md:rounded-tr-none group-hover:scale-110 transform-gpu transition ease-in-out duration-200 cursor-pointer"
                />
              </div>
            </Link>
            <div
              className="absolute p-4 bottom-0 md:right-0 md:top-0 md:p-4 md:bottom-0"
              style={{ height: 'min-content' }}
            >
              <TagSet>
                {tags.map((tag) => (
                  <Tag key={tag} name={tag} link={`/tags/${tag}`} />
                ))}
              </TagSet>
            </div>
          </div>
          <div className="p-4 md:w-1/2 lg:w-1/3 relative">
            <Link
              href={'/articles/[articleId]'}
              as={`/articles/${articleDir}`}
              passHref
            >
              <h2 className={`${style.heading} text-2xl`}>{title}</h2>
            </Link>
            <p className="mt-2 mb-10">{blurb}</p>
            <div className="text-right absolute bottom-0 right-0 p-6">
              <sub>{readTime}</sub>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LargeCard
