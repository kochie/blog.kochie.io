import React, { ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CardDetails } from '@/components/ArticleCards'
import Card from '@/components/Card'
import { Tag, TagSet } from '@/components/Tag'

import style from './ArticleCards.module.css'

const MediumCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): ReactElement => {
  return (
    <div className="md:col-span-3 col-span-6 w-full h-full group">
      <Card>
        <div className="flex flex-col relative h-full">
          <div className="bg-black rounded-t-2xl relative overflow-hidden">
            <div className="transition ease-in-out duration-200 group-hover:grayscale-0 grayscale-30 filter">
              <Image
                src={image.url}
                alt={image.alt}
                height={300}
                width={600}
                sizes="100vw"
                blurDataURL={image.lqip}
                placeholder="blur"
                className="rounded-t-2xl group-hover:scale-110 transform-gpu transition ease-in-out duration-200 cursor-pointer"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                }}
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
          <div className="p-4">
            <Link href={`/articles/${articleDir}`}>
              <h2 className={`${style.heading} text-2xl`}>{title}</h2>
            </Link>
            <p className="mb-8 mt-2">{blurb}</p>
            <div className="text-right absolute bottom-0 right-0 p-4">
              <sub>{readTime}</sub>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default MediumCard
