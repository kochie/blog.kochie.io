import React from 'react'
import { CardDetails } from '.'
import { Image, Tag } from '..'
import Link from 'next/link'
import style from '../../styles/articleCards.module.scss'
import { TagSet } from '../Tag'
// import lqip from "public/images/unsung.jpg?lqip"

export default ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails) => {
  return (
    <div className={`${style.card} ${style.small}`}>
      <div className={style.imageContainer}>
        <Image
          src={image.url}
          lqip={image.lqip}
          alt={image.alt}
          width={''}
          height={200}
          style={{ backgroundColor: 'black', borderRadius: '10px 10px 0 0' }}
          loadOnObserve
        />
        <div className={`${style.tagsSmall}`}>
          <TagSet>
            {tags.map((tag) => (
              <Tag key={tag} name={tag} link={`/tags/${tag}`} />
            ))}
          </TagSet>
        </div>
      </div>
      <div style={{ padding: '10px' }}>
        <Link href={'/articles/[articleId]'} as={`/articles/${articleDir}`}>
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
