import React from 'react'
import { CardDetails } from '.'
import { Image } from '..'
import Link from 'next/link'

import style from '../../styles/articleCards.module.scss'
import { TagSet, Tag } from '../Tag'

export default ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails) => {
  // const img = useRef<HTMLDivElement>(null)

  return (
    <div className={[style.card, style.large].join(' ')}>
      <div className={style.largeImageContainer}>
        <Image
          {...image}
          // height={300}
          loadOnObserve
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
        <p>{blurb}</p>
        <div className={style.readTime}>
          <sub>{readTime} min read</sub>
        </div>
      </div>
    </div>
  )
}
