import React, { ReactElement } from 'react'
import Link from 'next/link'
import { Image, Tag, TagSet, CardDetails, Card } from '..'

import style from './ArticleCards.module.css'

// import lqip from "public/images/unsung.jpg?lqip"

const SmallCard = ({
  title,
  image,
  blurb,
  readTime,
  tags,
  articleDir,
}: CardDetails): ReactElement => {
  return (
    <div className={style.small}>
      <Card>
        <div className={style.flexContainer}>
          <div className={style.imageContainer}>
            <Image
              src={image.url}
              lqip={image.lqip}
              alt={image.alt}
              width={''}
              height={200}
              // style={{
              //   backgroundColor: 'black',
              //   borderRadius: '10px 10px 0 0',
              // }}
              className={style.image}
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
      </Card>
    </div>
  )
}

export default SmallCard
