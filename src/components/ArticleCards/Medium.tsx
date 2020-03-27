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
  return (
    <div className={`${style.card} ${style.medium}`}>
      <div className={style.imageContainer}>
        <Image
          {...image}
          width={''}
          height={200}
          className={style.image}
          loadOnObserve
        />
        <div className={`${style.tagsMedium}`}>
          <TagSet>
            {tags.map(tag => (
              <Tag key={tag} name={tag} link={`/tags/${tag}`} />
            ))}
          </TagSet>
        </div>
      </div>
      <div style={{ padding: '10px' }}>
        <Link href={`/articles/${articleDir}`}>
          <h2 className={style.heading}>{title}</h2>
        </Link>
        <p>{blurb}</p>
        <div className={style.readTime}>
          <sub>{readTime} min read</sub>
        </div>
      </div>
    </div>
  )
}
