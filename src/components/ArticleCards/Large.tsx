import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CardDetails, TagSet, Tag, Card } from '..'

import style from './ArticleCards.module.css'

const LargeCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): React.ReactElement => {
  // const img = useRef<HTMLDivElement>(null)

  return (
    <div className="md:flex w-full h-full col-span-6">
      <Card>
        <div className="flex flex-col md:flex-row">
          <div className="relative rounded-t-lg md:rounded-l-lg md:w-1/2 lg:w-2/3">
            <Image
              src={image.url}
              alt={image.alt}
              layout={'responsive'}
              height={300}
              width={600}
              className="bg-black rounded-t-lg w-full h-52 md:rounded-l-lg md:rounded-tr-none md:h-80"
            />
            <div className="md:right-0 md:top-0 absolute p-4 bottom-0">
              <TagSet>
                {tags.map((tag) => (
                  <Tag key={tag} name={tag} link={`/tags/${tag}`} />
                ))}
              </TagSet>
            </div>
          </div>
          <div className="p-4 lg:w-1/3">
            <Link href={'/articles/[articleId]'} as={`/articles/${articleDir}`}>
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

export default LargeCard
