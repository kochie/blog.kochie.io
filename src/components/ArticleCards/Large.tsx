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
    <div className={style.large}>
      <Card>
        <div className={style.flexContainerLarge}>
          <div className={style.largeImageContainer}>
            <Image
              src={image.url}
              alt={image.alt}
              layout={'responsive'}
              height={300}
              width={600}
              className={style.largeImage}
            />
            <div className={`${style.tagsLarge}`}>
              <TagSet>
                {tags.map((tag) => (
                  <Tag key={tag} name={tag} link={`/tags/${tag}`} />
                ))}
              </TagSet>
            </div>
          </div>
          <div className={style.details}>
            <Link href={'/articles/[articleId]'} as={`/articles/${articleDir}`}>
              <h2 className={`${style.heading}`}>{title}</h2>
            </Link>
            <p className={style.blurb}>{blurb}</p>
            <div className={style.readTime}>
              <sub>{readTime} min read</sub>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default LargeCard
