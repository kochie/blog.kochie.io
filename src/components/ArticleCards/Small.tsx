import React, { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CardDetails } from '@/components/ArticleCards'
import Card from '@/components/Card'
import { Tag, TagSet } from '@/components/Tag'

import style from './ArticleCards.module.css'

const SmallCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): ReactElement => {
  return (
    <div className="md:col-span-3 lg:col-span-2 w-full h-full col-span-6 group">
      <Card>
        <div className="flex flex-col">
          <div className="relative bg-black rounded-t-2xl overflow-hidden">
            <div className="transition ease-in-out duration-200 group-hover:grayscale-0 grayscale-30 filter">
              <Image
                src={image.url}
                alt={image.alt}
                layout={'responsive'}
                height={300}
                width={600}
                objectFit="cover"
                blurDataURL={image.lqip}
                placeholder="blur"
                className="rounded-t-2xl group-hover:scale-110 transform-gpu transition ease-in-out duration-200 cursor-pointer"
              />
            </div>
            <div className="absolute p-4 bottom-0">
              <TagSet>
                {tags.map((tag) => (
                  <Tag key={tag} name={tag} link={`/tags/${tag}`} />
                ))}
              </TagSet>
            </div>
          </div>
          <div className="p-4 relative">
            <Link href={'/articles/[articleId]'} as={`/articles/${articleDir}`}>
              <h2 className={`${style.heading} text-2xl`}>{title}</h2>
            </Link>
            <p className="mt-2">{blurb}</p>
            <div className="text-right relative bottom-0 right-0 p-2">
              <sub>{readTime}</sub>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SmallCard
